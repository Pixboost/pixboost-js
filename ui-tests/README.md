# UI Tests

Running webdriver.io tests against examples.

## How to run

* Start the app (from root /)
    * `npm run server`
* Run the tests
    * `cd ui-tests`
    * `npm install`
    * `npm run install` (only once)
    * `npm run start-selenium`
    * `npm test`

Tests are using screenshot testing. Run below command from tests/ dir to update reference screenshots:

* `npm run update`

Test report is generated in the hermione/reports folder.