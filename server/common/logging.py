import os

LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'default': {
            'format': '%(asctime)s - %(threadName)s - %(levelname)s: %(message)s',
            'datefmt': '%Y-%m-%d %H:%M:%S'
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'level': 'INFO',
            'formatter': 'default',
        },
        'file': {
            'class': 'logging.handlers.TimedRotatingFileHandler',
            'level': 'INFO',
            'formatter': 'default',
            'filename': f"{os.environ.get('WORKDIR')}/logs/app.log",
            'when': 'midnight',
            'interval': 1
        },
    },
    'loggers': {
        '': {  # root logger
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'apscheduler': {  # Specific logger for apscheduler
            'handlers': ['console', 'file'],
            'level': 'ERROR',  # Set to WARNING to suppress INFO and DEBUG messages
            'propagate': False,  # Do not propagate to root logger
        },
        'httpx': {  # Specific logger for httpx
            'handlers': ['console', 'file'],
            'level': 'ERROR',  # Set to WARNING to suppress INFO and DEBUG messages
            'propagate': False,  # Do not propagate to root logger
        }
    }
}
