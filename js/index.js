/**
 * ============================================
 * MAIN ENTRY POINT (index.js)
 * ============================================
 * 
 * This file is the starting point of your application.
 * It handles:
 * - Getting DOM elements
 * - Form validation
 * - Starting the quiz
 * - Loading/error states
 * 
 * DOM ELEMENTS TO GET:
 * - quizOptionsForm: #quizOptions
 * - playerNameInput: #playerName
 * - categoryInput: #categoryMenu
 * - difficultyOptions: #difficultyOptions
 * - questionsNumber: #questionsNumber
 * - startQuizBtn: #startQuiz
 * - questionsContainer: .questions-container
 * 
 * FUNCTIONS TO IMPLEMENT:
 * - showLoading() - Display loading spinner
 * - hideLoading() - Remove loading spinner
 * - showError(message) - Display error card
 * - validateForm() - Check if form is valid
 * - showFormError(message) - Show error on form
 * - resetToStart() - Reset to initial state
 * - startQuiz() - Main function to start quiz
 */

import Quiz from "./quiz.js"
import Question from "./question.js"
// ============================================
// ?: Get DOM Element References (done)
// ============================================
let quizOptionsForm = document.getElementById("quizOptions");
let playerNameInput  = document.getElementById("playerName");
let categoryInput= document.getElementById("categoryMenu");
let difficultyOptions= document.getElementById("difficultyOptions");
let questionsNumber= document.getElementById("questionsNumber");
let startQuizBtn= document.getElementById("startQuiz");
let questionsContainer=document.querySelector(".questions-container");


// ============================================
// ?: Create variable to store current quiz
// ============================================
let currentQuiz = null;


// ============================================
// ? Create showLoading() function
// ============================================
function showLoading(){
    quizOptionsForm.classList.add("hidden");
questionsContainer.innerHTML =`
 <div class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading Questions...</p>
    </div>`
}
// ============================================
// ? Create hideLoading() function
// ============================================
function hideLoading(){
questionsContainer.innerHTML = ``;
}
// ============================================
//? Create showError(message) function
// ============================================
// Set questionsContainer.innerHTML to error HTML
// Include the message parameter in the display
// Add click listener to retry button that calls resetToStart()
function showError(message){
    questionsContainer.innerHTML =`
    <div class="game-card error-card">
      <div class="error-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3 class="error-title">Oops! Something went wrong</h3>
      <p class="error-message">${message}</p>
      <button class="btn-play retry-btn" onclick="resetToStart()">
        <i class="fa-solid fa-rotate-right"></i> Try Again
      </button>
    </div>
   `;
}

// ============================================
// ?: Create validateForm() function
// ============================================
// Return object: { isValid: boolean, error: string | null }
// Check:
// 1. questionsNumber has a value
// 2. Value is >= 1 (minimum questions)
// 3. Value is <= 50 (maximum questions)
function validateForm(){
    let msg =``;
    let state =true ;
if(questionsNumber.value !== "" ){
    if(questionsNumber.value < 1){
        msg =`Minimum 1 question required.`
        state =false;
    }
    else if(questionsNumber.value > 50){
        msg =`Maximum 50 questions allowed.`;
        state =false;
    }
}
if (state === false){
showFormError(msg);
}
 return { isValid: state,
     error: msg || null }
}

// ============================================
// ? Create showFormError(message) function
// ============================================
// Create error div with class 'form-error'
// Insert before the start button
// Remove after 3 seconds with fade effect
function showFormError(message){
    let error= document.createElement("div");
    error.classList.add("form-error")
    error.innerText =message;
    startQuizBtn.before(error);
    setTimeout(() => {
        error.remove();
    }, 3000);
}

// ============================================
// ? Create resetToStart() function
// ============================================
// 1. Clear questionsContainer
// 2. Reset form values
// 3. Show the form (remove 'hidden' class)
// 4. Set currentQuiz = null
function resetToStart(){
    questionsContainer.innerHTML="";
     categoryInput.value = "";
difficultyOptions.value = "easy";
questionsNumber.value = 10;
playerNameInput.value = "";
    quizOptionsForm.classList.remove("hidden");
     currentQuiz = null;
}

// ============================================
// ?Create async startQuiz() function
// ============================================
// This is the main function, called when Start button is clicked
// Steps:
// 1. Validate the form
// 2. If not valid, show error and return
// 3. Get form values:
//    - playerName (use 'Player' if empty)
//    - category
//    - difficulty
//    - numberOfQuestions
// 4. Create new Quiz instance
// 5. Hide the form (add 'hidden' class)
// 6. Show loading spinner
// 7. Try to fetch questions:
//    - await currentQuiz.getQuestions()
//    - Hide loading
//    - Check if questions exist
//    - Create first Question and display it
// 8. Catch any errors:
//    - Hide loading
//    - Show error message
 async function startQuiz(){
    if (validateForm().isValid === false){
        let formError = document.createElement("div");
        formError.classList.add("form-error");
        formError.innerHTML=`<i class="fa-solid fa-circle-exclamation"></i>
         Please enter the number of questions.`;
        document.body.append(formError);
         return;
    }
    
       let playerName = playerNameInput.value || "Player";
       let categorySelect = categoryInput.value; 
       let difficulty =  difficultyOptions.value; 
       let numberOfQuestions = questionsNumber.value;       
 currentQuiz = new Quiz(categorySelect ,difficulty,
    numberOfQuestions,
    playerName);
showLoading();
try{
    await currentQuiz.getQuestions();
    hideLoading();

    if (currentQuiz.questions.length === 0) {
    showError("No questions found.");
    return;
}
const question = new Question(
    currentQuiz,
    questionsContainer,
    resetToStart
);
question.displayQuestion();
}
catch(error){
    hideLoading();
showError("Failed to load questions. Please try again.");
}
 }
// ============================================
// ?: Add Event Listeners
// ============================================
// 1. startQuizBtn click -> call startQuiz()
// 2. questionsNumber keydown -> if Enter, call startQuiz()
startQuizBtn.addEventListener("click" ,function(){    
    startQuiz();
})
questionsNumber.addEventListener("keydown",function(eventInfo){    
    if(eventInfo.key === "Enter"){
        startQuiz();
    }
})

