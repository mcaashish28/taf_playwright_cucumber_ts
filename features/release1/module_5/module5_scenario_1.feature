@regression @module_5 @basic_auth
Feature: Basic Authentication

  Scenario: User authenticates using HTTP basic auth credentials
    Given I authenticate with basic auth using test data "basicAuthUser" and "basicAuthPassword"
    Then the page content should contain test data "basicAuthSuccessText"
