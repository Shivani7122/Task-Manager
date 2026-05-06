"""
Django settings for taskmanager project.
"""

from pathlib import Path
from datetime import timedelta
import os

import dj_database_url
from dotenv import load_dotenv

# ================= BASE =================

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv()

# ================= SECURITY =================

SECRET_KEY = "django-insecure-bn1kiulndslx7)=)cveoc*cbatm_*wfo)79gw9=8%=ghypvh_4"

DEBUG = True

ALLOWED_HOSTS = ["*"]

# ================= APPS =================

INSTALLED_APPS = [

    # CORS
    "corsheaders",

    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Third Party
    "rest_framework",

    # Local
    "core",
]

# ================= MIDDLEWARE =================

MIDDLEWARE = [

    # CORS MUST BE FIRST
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.security.SecurityMiddleware",

    # WhiteNoise
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ================= URLS =================

ROOT_URLCONF = "taskmanager.urls"

# ================= TEMPLATES =================

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {
            "context_processors": [

                "django.template.context_processors.request",

                "django.contrib.auth.context_processors.auth",

                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ================= WSGI =================

WSGI_APPLICATION = "taskmanager.wsgi.application"

# ================= DATABASE =================

DATABASES = {
    "default": dj_database_url.parse(
        os.environ.get("DATABASE_URL")
    )
}

# ================= AUTH PASSWORDS =================

AUTH_PASSWORD_VALIDATORS = [

    {
        "NAME":
        "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },

    {
        "NAME":
        "django.contrib.auth.password_validation.MinimumLengthValidator",
    },

    {
        "NAME":
        "django.contrib.auth.password_validation.CommonPasswordValidator",
    },

    {
        "NAME":
        "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# ================= INTERNATIONALIZATION =================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True

# ================= STATIC FILES =================

STATIC_URL = "static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_STORAGE = (
    "whitenoise.storage.CompressedManifestStaticFilesStorage"
)

# ================= CUSTOM USER =================

AUTH_USER_MODEL = "core.User"

# ================= REST FRAMEWORK =================

REST_FRAMEWORK = {

    "DEFAULT_AUTHENTICATION_CLASSES": [

        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
}

# ================= JWT =================

SIMPLE_JWT = {

    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
}

# ================= CORS =================

CORS_ALLOW_ALL_ORIGINS = True

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [

    "https://vigilant-guide-q7px6w69r7rh4q7g-5502.app.github.dev",
]

CORS_ALLOW_HEADERS = [

    "content-type",

    "authorization",
]

# ================= CSRF =================

CSRF_TRUSTED_ORIGINS = [

    "https://worthy-dream-production-a5ca.up.railway.app",

    "https://vigilant-guide-q7px6w69r7rh4q7g-5502.app.github.dev",
]