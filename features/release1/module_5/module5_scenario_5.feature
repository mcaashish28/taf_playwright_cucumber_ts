@regression @module_5 @infinite_scroll
Feature: Infinite Scroll

  Scenario: User scrolls to load more content
    Given I open the Infinite Scroll page
    When I scroll down 3 times
    Then the number of loaded paragraphs should be at least test data "infiniteScrollMinParagraphs"
