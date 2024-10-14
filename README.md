## Gotchas
- When running `npm start` check to make sure that metro isn't using expo build.  Should be able to press `s` to switch.
- The backend ip address is hard-coded and needs to match the value for the machine on which the local instance of the bff is running (use `ipconfig`)

## How to Build App
- https://docs.expo.dev/build/setup/
- run `npm run build:preview` (only 30 free builds per month though)

## Recovering from Corrupt Redux State
- try flushing the persistor
- re-install Expo Go
- fix and re-test the problem