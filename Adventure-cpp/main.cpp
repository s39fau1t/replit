#include <string>
#include <map>
#include <thread>
#include <chrono>
#include <iostream>

using namespace std;
using this_thread::sleep_for;
using chrono::milliseconds;

void animPrint(string text) {
	for(char character : text) {
		cout << character << flush;
		sleep_for(milliseconds(100));
	}
}

class Event {
	private:
		string text;
		map<string, Event> eventOutcomes;
		map<string, string> strOutcomes;
		bool isStringOutcome;
	public:
		Event(string txt, map<string, Event> results) {
			text = txt;
			eventOutcomes = results;
			isStringOutcome = false;
		}

		Event(string txt, map<string, string> results) {
			text = txt;
			strOutcomes = results;
			isStringOutcome = true;
		}

		Event() {}

		void run() {
			animPrint(text + "\n");

			string input;

			getline(cin, input);

			for(char &character : input) {
				character = tolower(character);
			}

			if(isStringOutcome) {
				string result = strOutcomes[input];

				if(result != "") {
					animPrint(strOutcomes[input] + "\n");
				}else {
					run();
				}
			}else {
				Event result = eventOutcomes[input];
				if(result.text != "") {
					result.run();
				}else {
					run();
				}
			}
		}
};

int main() {
	Event myEvent("Hello!\nHi or hello?", {{"hello", Event("You chose hello!\nYes or no?", {{"yes!", "Yay!"}, {"no", "Aww..."}})}, {"hi", Event("You chose hi!\nYes or no?",{{"yes!", "Yay!"}, {"no", "Aww..."}})}});

	myEvent.run();

	return 0;
}