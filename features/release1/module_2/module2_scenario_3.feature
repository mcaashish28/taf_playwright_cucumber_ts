@regression @module_2 @hovers
Feature: Hovers

  Scenario: User hovers over a profile and sees the caption from test data
    Given I open the Hovers page
    When I hover over user from test data "hoverUserIndex"
    Then the caption should match test data "hoverUserCaption"
