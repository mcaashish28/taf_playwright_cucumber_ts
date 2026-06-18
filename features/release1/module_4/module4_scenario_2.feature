@regression @module_4 @download
Feature: File Download

  Scenario: User downloads a file successfully
    Given I open the File Download page
    When I download the first available file
    Then the downloaded file should exist on disk
