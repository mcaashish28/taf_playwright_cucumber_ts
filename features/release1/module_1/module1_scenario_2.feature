@regression @module_1 @login
Feature: Form Authentication - Invalid Login

  Scenario: User cannot log in with invalid credentials
    Given I open the Login page
    When I login using test data "invalidUser" and "invalidPassword"
    Then the flash message should contain test data "loginFailureMessage"
