@regression @module_4 @upload
Feature: File Upload

  Scenario: User uploads a file successfully
    Given I open the File Upload page
    When I upload the file from test data "uploadFileName"
    Then the uploaded file name should match test data "uploadFileName"
