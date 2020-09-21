'use strict'

function SpeechRecognitionForm(SpeechRecognitionFactory) {

	/**
	* Controller 
	**/
	function SpeechRecognitionCtrl($scope) {
		this.textFields = [];
		this.current = 0;

		this.getNext = function() {
			var next = this.current++;
			if(next <= this.textFields.length) {
				return this.textFields[next];
			}

			this.current = 0;
			return this.textFields[this.current];
		}

		this.getPrevious = function() {
			var previous = this.current--;
			if(previous >= 0) {
				return this.textFields[previous];
			}

			this.current = this.textFields.length;
			return this.textFields[this.current];
		}

		this.getCurrent = function() {
			return this.textFields[this.current];
		}
	}

	/**
	* link function
	**/
	function link($scope, el, attrs, controller) {
		var currentEl, previousEl, recognition;

		controller.textFields = (function getAllTextFields(index) {
			var parentNode = el
			  , elements = parentNode.children()[0]
			  , args = Array.prototype.slice.apply(parentNode.children()[0])

			return args.filter(function(child) {
				return child.tagName 
					&& child.tagName.toLowerCase() === 'input'; 
			});
		})();

		recognition = SpeechRecognitionFactory.getInstance();
		SpeechRecognitionFactory.setConfig();

		recognition.addEventListener('result', function(e) {
			var transcript = "";
			for (var i = event.resultIndex; i < event.results.length; ++i) {
		    	if (event.results[i].isFinal) {
		    		transcript = event.results[i][0].transcript.trim();
		    		
		    		if(transcript === "next") {
				    	console.log("calling next...")
				    	currentEl = controller.getNext();
				    	currentEl.focus();
				    } else if (transcript === "previous") {
				    	console.log("calling previous...")
				    	currentEl = controller.getPrevious();
				    	currentEl.focus(); 
				    } else {
				    	console.log("typing")
				    	currentEl = controller.getCurrent();
				    	currentEl.value = transcript;
				    }
		    	}
		    }
		});

		recognition.start();
	}

	// Runs during compile
	return {
		scope: {}, 
		controller: SpeechRecognitionCtrl,
		controllerAs: "vm",
		transclude: true,
		template: "<form action='#' ng-transclude></form>",
		restrict: 'E', 
		link: link
	};
}

function SpeechRecognitionFactory() {
	var speechRecognition = null
	  , defaults = {
			interimResults: true,
			continuous: true,
			language: 'us-en'
		} 

	this.getInstance = function() {
		if(!speechRecognition) {
			speechRecognition = new webkitSpeechRecognition();	
		}
		
		return speechRecognition; 
	}

	this.setConfig = function(properties) {
		properties = !properties 
			? defaults
			: properties

		for(var option in properties) {
			speechRecognition[option] = properties[option];
		}
	}

	return this;
}



angular.module('speech-recognition', [])
	.factory('SpeechRecognitionFactory', SpeechRecognitionFactory)
	.directive('amSpeechRecognitionForm', ['SpeechRecognitionFactory', SpeechRecognitionForm]);