@regression @module_1 @login
Feature: Form Authentication - Valid Login

  Scenario: User logs in with valid credentials from test data
    Given I open the Login page
    When I login using test data "validUser" and "validPassword"
    Then I should land on the Secure Area
    And the flash message should contain test data "loginSuccessMessageWrong"
