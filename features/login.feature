Feature: Log in to the Kayak website with the account that was automatically created
  @login
  Scenario: Log in
    Given I am on the Kayak homepage
    And I accept the cookie consent prompt
    When I land on Kayak English homepage
    And I accept the cookie consent prompt
    And I log in with the previously generated account if it exists, otherwise I create a new one
    And I clear the default departure airport
    Then I select the airport described by the following values as origin
      | City     | Country | Code |
      | Madrid   | Spain   | MAD  |
    Then I select the airport described by the following values as destination
      | City     | Country | Code |
      | Berlin   | Germany | BER  |
    Then I select a random departure date within the next calendar month
    Then I select a random return date within the next calendar month
    And I verify the default criteria for the travel search is "1 adult, Economy"
    And I uncheck the option to compare prices with Priceline
    When I search for flights
    Then I land on flights results page and I wait for all the entries to be fully loaded