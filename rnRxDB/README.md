# rnRxDB

This project is an example of RxDB working with a react-native app and syncing to a couchdb container running on Docker.

To run (these steps assume you have docker installed and have previously ran react-native apps):
- Open 3 terminals in the `<repo_location>/battalion-examples/rnrxdb` directory
- Terminal 1: run `yarn ios --simulator "iPhone 12"`
- Terminal 2: run `yarn ios --simulator "iPhone 12 Pro"`
- Terminal 3: run `yarn server:start` to start couchdb container and `yarn server:stop` when finished

The above steps will start 2 iphone simulators and a couchdb container. Enter your list of heroes in the app, delete them, and watch data replication in action between the simulators and the couchdb instance. The couchdb web interface can be accessed at http://localhost:5984/_utils (user: admin, pw: password). 
