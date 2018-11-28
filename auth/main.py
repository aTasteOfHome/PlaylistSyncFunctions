import logging
import json
from os import environ
import google.oauth2.credentials
import google_auth_oauthlib.flow


# # Use the client_secret.json file to identify the application requesting
# # authorization. The client ID (from that file) and access scopes are required.
# flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
#     'client_secret.json',
#     scope=['https://www.googleapis.com/auth/drive.metadata.readonly'])

# # Indicate where the API server will redirect the user after the user completes
# # the authorization flow. The redirect URI is required.
# flow.redirect_uri = 'https://www.example.com/oauth2callback'

# # Generate URL for request to Google's OAuth 2.0 server.
# # Use kwargs to set optional request parameters.
# authorization_url, state = flow.authorization_url(
#     # Enable offline access so that you can refresh an access token without
#     # re-prompting the user for permission. Recommended for web server apps.
#     access_type='offline',
#     # Enable incremental authorization. Recommended as a best practice.
#     include_granted_scopes='true')

#TODO: use pipenv for everything
def main(*args):
    for arg in args:
        print(arg)
        print(type(arg))
        print(type(arg).__name__)
        print(type(arg).__class__.__name__)
        print('\n')

    # Use the client_secret.json file to identify the application requesting
    # authorization. The client ID (from that file) and access scopes are required.
    # flow = google_auth_oauthlib.flow.Flow.from_client_secrets_file(
    #     'client_secret.json',
    #     scope=['https://www.googleapis.com/auth/drive.metadata.readonly'])
    
    with open('./client_info.json', "r") as f:
        client_info = json.load(f)
        print(json.dumps(client_info))
        web = client_info['web']
        if web is None:
            logging.error('Failed to parse client info')
            logging.debug(client_info)
            return
        web['client_id'] = environ['CLIENT_ID']
        web['client_secret'] = environ['CLIENT_SECRET']
        web['project_id'] = environ['PROJECT_ID']
        web['redirect-uris'].append(environ['REDIRECT_URI'])
        flow = google_auth_oauthlib.flow.Flow.from_client_config(
            client_info,
            scope=['https://www.googleapis.com/auth/drive.metadata.readonly'])

        # Indicate where the API server will redirect the user after the user completes
        # the authorization flow. The redirect URI is required.
        flow.redirect_uri = 'https://www.example.com/oauth2callback'

        # Generate URL for request to Google's OAuth 2.0 server.
        # Use kwargs to set optional request parameters.
        authorization_url, state = flow.authorization_url(
            # Enable offline access so that you can refresh an access token without
            # re-prompting the user for permission. Recommended for web server apps.
            access_type='offline',
            # Enable incremental authorization. Recommended as a best practice.
            include_granted_scopes='true')
        print(authorization_url)
        print(state)
        return
    return