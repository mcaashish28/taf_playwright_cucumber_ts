@regression
Feature: Playwright Docs - Installation Page

  Scenario: Verify Installation page title and heading
    Given I navigate to the Installation page
    Then the page title should contain "Installation"
    And the page heading should display "Installation"
