import requests
import json

class Firebase:

  def __init__(self, url):
    self._url = url

  def child(self, key):
    return Firebase(self._url + '/' + key)

  def remove(self ):
    requests.delete(self._url + '.json')
    response.raise_for_status()

  def get(self):
    response = requests.get(self._url + '.json')
    response.raise_for_status()
    return response.json()

  def set(self, value):
    response = requests.put(self._url + '.json', json.dumps(value))
    response.raise_for_status()

  def set_with_priority(self, value, priority):
    value = dict(value)
    value['.priority'] = priority
    response = requests.put(self._url + '.json', json.dumps(value))
    response.raise_for_status()
