# Pittsburgh buses live map

Running live at http://pitlivebus.com.

## Requirements

* Python and python-pip
* Firebase account (and update the files with your firebase url)
* Google maps API key (and update index.html with your key)

## Setup

```
$ cd backend
$ sudo pip install -r requirements.txt
$ while [ 1 ]; do python pat_to_firebase.py; sleep 5; done
```

Open web/index.html.

## Credits

* [FireBase Open Transit example](https://www.firebase.com/docs/open-data/transit.html)
* [Port Authority of Allegheny County’s Real-Time System](http://realtime.portauthority.org/bustime/home.jsp)

## See also

[Reddit thread](http://www.reddit.com/r/pittsburgh/comments/2iyoja/live_bustracking_map/)
