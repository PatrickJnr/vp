import os
import json
import sys
import time
import webbrowser
import logging
import random

from dotenv import load_dotenv, set_key
import pyimgur
from PIL import Image, ImageFilter

logging.basicConfig(
    level=logging.INFO, 
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('imgur_uploader.log')
    ]
)

def file_name_without_file_extension(file_name):
    return os.path.splitext(file_name)[0]

def get_ar(file_name):
    with Image.open(file_name) as shot:
        h = shot.height
        w = shot.width
        return w / h

def createthumbnail(file_path, size):
    with Image.open(file_path) as shot:
        h = shot.height
        w = shot.width
        ar = w / h

        ht = size
        wt = int(ar * size)

        shot = shot.convert('RGB')
        shot = shot.filter(ImageFilter.SHARPEN)
        shot = shot.resize((wt, ht), Image.Resampling.LANCZOS)

        folder, file_name = os.path.split(file_path)

        newpath = os.path.join(folder, 'thumbnails')
        if not os.path.exists(newpath):
            os.makedirs(newpath)

        saved_filename = os.path.join(newpath, f"{file_name_without_file_extension(file_name)}-{str(size)}.jpg")

        shot.save(saved_filename, "JPEG", quality=95)

        return saved_filename

def upload_shot(file_path, imgur_album, im):
    try:
        logging.info(f"Uploading {file_path}")

        if imgur_album is None:
            uploaded_image = im.upload_image(file_path)
        else:
            uploaded_image = im.upload_image(file_path, album=imgur_album)

        logging.info(f"Uploaded {file_path} successfully: {uploaded_image.link}")
        return uploaded_image
    except Exception as e:
        logging.error(f"Error uploading {file_path}: {e}")

        if hasattr(e, 'response'):
            logging.error(f"Response details: {e.response.status_code}")
            logging.error(f"Response content: {e.response.content}")

        return None

def is_shit_in_album(file_name, album):
    return any(file_name in img.get("file_name", "") for img in album)

def generate_album(directory_name, im):
    imgur_album = None

    try:
        logging.info(f"Attempting to create album with name: {directory_name}")

        try:

            imgur_album = im.create_album(directory_name)
            logging.info(f"Album '{directory_name}' created successfully.")
        except Exception as e:
            logging.warning(f"Failed to create album: {e}")
            logging.warning("Continuing without a specific album...")
    except Exception as e:
        logging.error(f"Unexpected error in album creation: {e}")

    album = []

    if os.path.exists(f'{directory_name}.json'):
        try:
            with open(f'{directory_name}.json') as json_file:
                album = json.load(json_file)
                logging.info("Continuing previous uploading session.")
        except json.JSONDecodeError:
            logging.warning("Could not read existing JSON. Starting fresh.")

    for dirpath, _, filenames in os.walk(directory_name):
        for file_name in filenames:

            if not file_name.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".bmp")):
                logging.warning(f"Skipping non-image file: {file_name}")
                continue

            if is_shit_in_album(file_name, album):
                logging.info(f"{file_name} uploaded in previous session, skipping...")
                continue

            img = {'file_name': file_name}
            absolute_path = os.path.abspath(os.path.join(dirpath, file_name))

            imgur_image = upload_shot(absolute_path, imgur_album, im)
            if imgur_image is None:
                continue

            img['imageFull-link'] = imgur_image.link

            for size in [600, 1080]:
                logging.info(f"Uploading thumbnail of size {size}.")
                try:
                    thumbnail_path = createthumbnail(absolute_path, size)
                    thumbnail_imgur = upload_shot(thumbnail_path, imgur_album, im)
                    if thumbnail_imgur is None:
                        continue

                    img_key = f'thumbnail-link-{size}' if size == 600 else 'image1080-link'
                    img[img_key] = thumbnail_imgur.link

                    logging.info("Sleeping to avoid hitting the API rate limit.")
                    time.sleep(random.uniform(60, 120))
                except Exception as e:
                    logging.error(f"Error creating/uploading thumbnail: {e}")

            img['aspect-ratio'] = str(get_ar(absolute_path))

            album.append(img)

            try:
                with open(f'{directory_name}.json', 'w') as f:
                    json.dump(album, f, indent=4)
            except Exception as e:
                logging.error(f"Could not save album JSON: {e}")

    logging.info(f"Album {directory_name} upload complete!")
    return album

def imgur_log():
    load_dotenv()

    CLIENT_ID = os.getenv('CLIENT_ID')
    CLIENT_SECRET = os.getenv('CLIENT_SECRET')
    ACCESS_TOKEN = os.getenv('ACCES_TOKEN')
    REFRESH_TOKEN = os.getenv('REFRESH_TOKEN')

    if not all([CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN, REFRESH_TOKEN]):
        logging.error("Missing Imgur API credentials. Check your .env file.")
        sys.exit(1)

    logging.info("Imgur API credentials loaded successfully.")

    im = pyimgur.Imgur(CLIENT_ID, CLIENT_SECRET, ACCESS_TOKEN, REFRESH_TOKEN)

    if not im.is_authenticated:
        if REFRESH_TOKEN:
            try:
                logging.info("Access token expired, requesting another.")
                im.refresh_access_token()
                logging.info("Access token refreshed successfully.")
            except Exception as e:
                logging.error(f"Error refreshing access token: {e}")
                sys.exit(1)
        else:

            auth_url = im.authorization_url('pin')
            webbrowser.open(auth_url)
            pin = input("What is the pin? ")
            try:
                access_token, refresh_token = im.exchange_pin(pin)

                set_key(dotenv_path=".env", key_to_set="REFRESH_TOKEN", value_to_set=refresh_token)
                set_key(dotenv_path=".env", key_to_set="ACCES_TOKEN", value_to_set=access_token)
            except Exception as e:
                logging.error(f"Authentication failed: {e}")
                sys.exit(1)

    return im

def main():
    try:
        directory_name = sys.argv[1]
    except IndexError:
        logging.error('Please pass directory_name as an argument.')
        sys.exit(1)

    im = imgur_log()
    generate_album(directory_name, im)
    logging.info(f"Album {directory_name} created successfully!")
    time.sleep(3)

if __name__ == "__main__":
    main()