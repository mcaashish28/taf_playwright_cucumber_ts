@regression
Feature: Playwright Docs - Writing Tests Page

  Scenario: Verify Writing Tests page title and heading
    Given I navigate to the Writing Tests page
    Then the page title should contain "Writing tests"
    And the page heading should display "Writing tests"
