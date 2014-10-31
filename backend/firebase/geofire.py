import json
from geofire_utils import validate_key, validate_location, encode_geofire_object, encode_geohash


class GeoFire:

  def __init__(self, firebaseRef):
    self._firebaseRef = firebaseRef

  def set(self, key, location):
    validate_key(key)
    if location:
      # Setting location to null is valid since it will remove the key
      validate_location(location)

    if location is None:
      self._firebaseRef.child(key).remove();
    else:
       geohash = encode_geohash(location)
       self._firebaseRef.child(key).set_with_priority(encode_geofire_object(location, geohash), geohash)

  def setMany(self, keys_and_locations):
    value = {}
    for key, location in keys_and_locations.iteritems():
      validate_key(key)
      validate_location(location)
      geohash = encode_geohash(location)
      encoded = encode_geofire_object(location, geohash)
      encoded['.priority'] = geohash
      value[key] = encoded
    self._firebaseRef.set(value)
