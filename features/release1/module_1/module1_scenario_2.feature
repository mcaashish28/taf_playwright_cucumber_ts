@regression
Feature: Playwright Docs - Installation Page Navigation Links

  Scenario: Verify sidebar navigation links on Installation page
    Given I navigate to the Installation page
    Then I should see the "Writing tests" link in the sidebar
    And I should see the "Generating tests" link in the sidebar
