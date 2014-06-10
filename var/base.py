"""Common settings shared between developers and environments."""
from __future__ import absolute_import

import importlib
import os

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'genesis',
        'USER': '',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '',
    }
}

AUTH_USER_MODEL = 'server.GenUser'


########## PATH CONFIGURATION
# Absolute filesystem path to this Django project directory.
DJANGO_ROOT = os.path.dirname(os.path.abspath(os.path.join(__file__, os.pardir)))


def path_prepare(*args):
    """Make folders in the path if they do not exist."""
    path = os.path.join(*args)
    if not os.path.exists(path):
        os.makedirs(path)
    return path

# Site name.
SITE_NAME = os.path.basename(DJANGO_ROOT)

# Absolute filesystem path to the top-level project folder.
PROJECT_ROOT = os.path.dirname(DJANGO_ROOT)


########## GENERAL CONFIGURATION
TIME_ZONE = 'Europe/Ljubljana'
LANGUAGE_CODE = 'en-gb'
SITE_ID = 1

ALLOWED_HOSTS = ['.genialis.com', 'localhost']

SECRET_KEY = 'gencloud%9ij3pnz%tx9&44%k=-9i7v=!ay=io$bxizl#ac6pax(^xkem^'

if os.path.isfile(os.path.join(PROJECT_ROOT, 'secret_key')):
    SECRET_KEY = open(os.path.join(PROJECT_ROOT, 'secret_key')).read().strip()

# Internationalization
USE_I18N = True
USE_L10N = True
USE_TZ = True


########## MEDIA CONFIGURATION
MEDIA_ROOT = path_prepare(PROJECT_ROOT, 'media')
MEDIA_URL = '/media/'


########## STATIC FILE CONFIGURATION
STATIC_ROOT = path_prepare(PROJECT_ROOT, 'static')
STATIC_URL = '/static/'
ADMIN_MEDIA_PREFIX = '/static/admin/'

# Additional locations of static files.
STATICFILES_DIRS = ('/srv/genome_browser',)

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    "django.contrib.staticfiles.finders.AppDirectoriesFinder",
    #'django.contrib.staticfiles.finders.DefaultStorageFinder',
    'compressor.finders.CompressorFinder',
)


########## TEMPLATE CONFIGURATION
# Directories to search when loading templates.
TEMPLATE_DIRS = ()

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    "django.template.loaders.app_directories.Loader",
    #'django.template.loaders.eggs.Loader',
)


########## MIDDLEWARE CONFIGURATION
MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)


########## TEMPLATE CONTEXT CONFIGURATION
TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.core.context_processors.tz",
    "django.contrib.messages.context_processors.messages",
    "genesis.context_processors.analytics"
)


########## APP CONFIGURATION
INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Admin panel and documentation.
    'django.contrib.admin',
    'django.contrib.admindocs',

    # South migration tool
    'south',

    # Django compressor for CSS & JS
    'compressor',

    # API
    'tastypie',
    'tastypie_mongoengine',

    # Genesis
    'genesis',
    'server',
    'server.login',
    'gencloud',
)

GENAPPS = ()

for name in os.listdir(os.path.join(PROJECT_ROOT, 'genapps')):
    if os.path.isdir(os.path.join(PROJECT_ROOT, 'genapps', name)):
        app = 'genapps.{}'.format(name)
        try:
            importlib.import_module(app)
            INSTALLED_APPS += (app, )
            shortname = name[7:] if name.startswith('genapp-') else name
            GENAPPS += ({'title': shortname, 'name': name, 'url': shortname}, )
        except ImportError:
            pass # TODO: logging


########## URL CONFIGURATION
ROOT_URLCONF = '%s.urls' % SITE_NAME


########## LOGGING CONFIGURATION
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse',
        },
        'require_debug_true': {
            '()': 'django.utils.log.RequireDebugTrue',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'filters': ['require_debug_true'],
            'class': 'logging.StreamHandler',
        },
        'null': {
            'class': 'logging.NullHandler',
        },
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler',
            'include_html': True,
        },
        'postgres': {
            'level': 'DEBUG',
            'class': 'server.utils.PostgresLogHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
        },
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': False,
        },
        'py.warnings': {
            'handlers': ['console'],
        },
        'genesis.action': {
            'handlers': ['postgres'],
            'level': 'DEBUG',
            'propagate': False,
        },
    }
}


########## COMPRESS CONFIGURATION
COMPRESS_PRECOMPILERS = (
    ('text/less', 'lessc {infile} {outfile} --include-path=' + DJANGO_ROOT),
    # ('text/coffeescript', 'coffee --compile --stdio'),
)

COMPRESS_CSS_FILTERS = (
    'compressor.filters.cssmin.CSSMinFilter',
)

COMPRESS_JS_FILTERS = (
    'compressor.filters.jsmin.JSMinFilter',
    #'compressor.filters.jsmin.SlimItFilter',
)


########## TASTYPIE CONFIGURATION
TASTYPIE_DATETIME_FORMATTING = 'iso-8601'
API_LIMIT_PER_PAGE = 0
TASTYPIE_ABSTRACT_APIKEY = True


########## OTHER CONFIGURATION
WSGI_APPLICATION = 'genesis.wsgi.application'

LOGIN_URL = '/user/login/'
# use custom User for authentication

# email settings
EMAIL_USE_TLS = True
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = None  # set this in production settings
EMAIL_HOST_PASSWORD = None  # set this in production settings

FILE_UPLOAD_HANDLERS = (
    'django.core.files.uploadhandler.TemporaryFileUploadHandler',
)

FILE_UPLOAD_TEMP_DIR = 'media/'
