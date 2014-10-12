import requests
import xmltodict
import time
import random
from firebase import firebase

fb = firebase.FirebaseApplication('https://radiant-torch-6140.firebaseio.com/', None)

def api(method, **kwargs):
  url = 'http://realtime.portauthority.org/bustime/map/'
  kwargs['key'] = random.random()
  r = requests.get(url + method + '.jsp', params = kwargs)
  return xmltodict.parse(r.text)

def get_buses(route):
  return api('getBusesForRoute', route=route)

def pat_to_firebase(bus):
  return {
    'lat': bus['lat'],
    'lon': bus['lon'],
    'routeTag': bus['rt']
  }

routes = ['13', '16', '26', '27', '28X', '36', '38', '39', '41', '48', '54', '56', '57', '58', '59', '6', '61A', '61B', '61C', '61D', '67', '69', '71A', '71B', '71C', '71D', '75', '8', '82', '86', '88', '93', 'G2', 'O12', 'P1', 'P10', 'P12', 'P2', 'P3', 'Y1', 'Y49']
buses = get_buses(','.join(routes))['buses']

if 'bus' not in buses:
  buses['bus'] = []

buses = buses['bus']
if not isinstance(buses, list):
  buses = [buses]

vehicles = {bus['id']: pat_to_firebase(bus) for bus in buses}
fb.put('/pittsburgh/', 'vehicles', vehicles)
