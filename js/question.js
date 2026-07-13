/**
 * ============================================
 * QUESTION CLASS
 * ============================================
 * 
 * This class handles displaying and interacting with a single question.
 * 
 * PROPERTIES TO CREATE:
 * - quiz (Quiz) - Reference to the Quiz instance
 * - container (HTMLElement) - DOM element to render into
 * - onQuizEnd (Function) - Callback when quiz ends
 * - questionData (object) - Current question from quiz.getCurrentQuestion()
 * - index (number) - Current question index
 * - question (string) - The decoded question text
 * - correctAnswer (string) - The decoded correct answer
 * - category (string) - The decoded category name
 * - wrongAnswers (array) - Decoded incorrect answers
 * - allAnswers (array) - Shuffled array of all answers
 * - answered (boolean) - Has user answered? Starts false
 * - timerInterval (number) - The setInterval ID
 * - timeRemaining (number) - Seconds left, starts at 30 seconds
 * 
 * METHODS TO IMPLEMENT:
 * - constructor(quiz, container, onQuizEnd)
 * - decodeHtml(html) - Decode HTML entities like &amp;
 * - shuffleAnswers() - Shuffle answers randomly
 * - getProgress() - Calculate progress percentage
 * - displayQuestion() - Render the question HTML
 * - addEventListeners() - Add click handlers to answers
 * - removeEventListeners() - Cleanup handlers
 * - startTimer() - Start countdown
 * - stopTimer() - Stop countdown
 * - handleTimeUp() - When timer reaches 0
 * - checkAnswer(choiceElement) - Check if answer is correct
 * - highlightCorrectAnswer() - Show correct answer
 * - getNextQuestion() - Load next or show results
 * - animateQuestion(duration) - Transition to next
 * 
 * HTML ENTITIES:
 * The API returns text with HTML entities like:
 * - &amp; should become &
 * - &quot; should become "
 * - &#039; should become '
 * 
 * Use this trick to decode:
 * const doc = new DOMParser().parseFromString(html, 'text/html');
 * return doc.documentElement.textContent;
 * 
 * SHUFFLE ALGORITHM (Fisher-Yates):
 * for (let i = array.length - 1; i > 0; i--) {
 *   const j = Math.floor(Math.random() * (i + 1));
 *   [array[i], array[j]] = [array[j], array[i]];
 * }
 */


const correctSound = new Audio("../sounds/correct.mp3");
const wrongSound = new Audio("../sounds/wrong.mp3");
const warningSound = new Audio("../sounds/warning.mp3");
export default class Question {
  
  //? Create constructor(quiz, container, onQuizEnd)
  // 1. Store the three parameters
  // 2. Get question data: this.questionData = quiz.getCurrentQuestion()
  // 3. Store index: this.index = quiz.currentQuestionIndex
  // 4. Decode and store: question, correctAnswer, category
  // 5. Decode wrong answers (use .map())
  // 6. Shuffle all answers
  // 7. Initialize: answered = false, timerInterval = null, timeRemaining
  constructor(quiz, container, onQuizEnd){
    this.quiz=quiz;
    this.container=container;
    this.onQuizEnd=onQuizEnd;
    this.questionData = quiz.getCurrentQuestion();
    this.index = quiz.currentQuestionIndex;
    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);
    this.wrongAnswers = this.questionData.incorrect_answers.map(answer =>
    this.decodeHtml(answer));
    this.allAnswers=this.shuffleAnswers();
    this.answered =false;
    this.timerInterval = null;
    this.timeRemaining =15;

  }
  
  // ? Create decodeHtml(html) method
  // Use DOMParser to decode HTML entities
  decodeHtml(html){
     const doc = new DOMParser().parseFromString(html, 'text/html');
     return doc.documentElement.textContent;

  }
  
  //? Create shuffleAnswers() method
  // 1. Combine wrongAnswers and correctAnswer into one array
  // 2. Shuffle using Fisher-Yates algorithm
  // 3. Return shuffled 
  shuffleAnswers(){
    let array = [...this.wrongAnswers ,this.correctAnswer];
    for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
  }
 
  //? Create getProgress() method
  // Calculate: ((index + 1) / quiz.numberOfQuestions) * 100
  // Round to whole number
  getProgress(){
     return Math.round((this.index+1)/(this.quiz.numberOfQuestions) * 100);
  }

  //? Create displayQuestion() method
  // 1. Create HTML string for the question card
  //    (See index.html for the structure to use)
  // 2. Use template literals with ${} for dynamic data
  // 3. Set this.container.innerHTML = yourHTML
  // 4. Call this.addEventListeners()
  // 5. Call this.startTimer()
  displayQuestion(){
    let qCard ='';

    qCard +=`<div class="game-card question-card">
      
      <div class="xp-bar-container">
        <div class="xp-bar-header">
          <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
          <span class="xp-value">Round${this.index + 1}/${this.quiz.numberOfQuestions}</span>
        </div>
        <div class="xp-bar">
          <div class="xp-bar-fill" style="width:${this.getProgress()}%"></div>
        </div>
      </div>

      <div class="stats-row">
        <div class="stat-badge category">
          <i class="fa-solid fa-bookmark"></i>
          <span>${this.category}</span>
        </div>
        <div class="stat-badge difficulty ${this.quiz.difficulty}">
          <i class="fa-solid fa-face-smile"></i>
          <span>${this.quiz.difficulty}</span>
        </div>
        <div class="stat-badge timer">
          <i class="fa-solid fa-stopwatch"></i>
          <span class="timer-value">${this.timeRemaining}</span>s
        </div>
        <div class="stat-badge counter">
          <i class="fa-solid fa-gamepad"></i>
          <span>${this.index+1}/${this.quiz.numberOfQuestions}</span>
        </div>
      </div>

      <h2 class="question-text">${this.question}</h2>
      <div class="answers-grid">

`

for (let i = 0; i < this.allAnswers.length; i++) {
qCard +=
`
        <button class="answer-btn" data-answer="${this.allAnswers[i]}">
          <span class="answer-key">${i+1}</span>
          <span class="answer-text">${this.allAnswers[i]}</span>
        </button>
      `}

      qCard +=`
      </div>

      <p class="keyboard-hint">
        <i class="fa-regular fa-keyboard"></i> Press 1-${this.allAnswers.length} to select
      </p>
      <div class="score-panel">
        <div class="score-item">
          <div class="score-item-label">Score</div>
          <div class="score-item-value">${this.quiz.score}</div>
        </div>
      </div>
    </div>` 
this.container.innerHTML = qCard;
 this.addEventListeners()
  this.startTimer()
  }
  
  // ? Create addEventListeners() method
  // 1. Get all answer buttons: document.querySelectorAll('.answer-btn')
  // 2. Add click event to each: call this.checkAnswer(button)
  // 3. Add keyboard support: listen for keys 1-4
  //    Valid keys are: ['1', '2', '3', '4']
 addEventListeners() {
    const allAnswersBtns = document.querySelectorAll(".answer-btn");
    allAnswersBtns.forEach((button) => {
        button.addEventListener("click", () => {
            this.checkAnswer(button);
        });
    });
    this.keyHandler = (event) => {
        const keys = ["1", "2", "3", "4"];
        if (keys.includes(event.key)) {
            const index = Number(event.key) - 1;
            if (allAnswersBtns[index]) {
                this.checkAnswer(allAnswersBtns[index]);
            }}};
    document.addEventListener("keydown", this.keyHandler);
}
  
  
  //؟ Create removeEventListeners() method
  // Remove any keyboard listeners you added
  removeEventListeners(){
    document.removeEventListener("keydown", this.keyHandler);
  }
  
  
  //? Create startTimer() method
  // 1. Get timer display element
  // 2. Use setInterval to run every 1000ms (1 second)
  // 3. Decrement timeRemaining
  // 4. Update the display
  // 5. If timeRemaining <= 10 seconds, add 'warning' class
  // 6. If timeRemaining <= 0, call stopTimer() and handleTimeUp()
  startTimer(){
    let timerDisplayElement = document.querySelector(".timer-value");
    this.timerInterval =setInterval(() => {
      this.timeRemaining--;
      timerDisplayElement.textContent=this.timeRemaining;
      if(this.timeRemaining === 3){
    warningSound.currentTime = 0;
    warningSound.play();
}
      if( this.timeRemaining <= 0){
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);}

  
  
  // ?Create stopTimer() method
  // Use clearInterval(this.timerInterval)
  stopTimer(){
        clearInterval(this.timerInterval);
  }
  
  
  // ? Create handleTimeUp() method
  // 1. Set answered = true
  // 2. Call removeEventListeners()
  // 3. Show correct answer (add 'correct' class)
  // 4. Show "TIME'S UP!" message
  // 5. Call animateQuestion() after a delay
  handleTimeUp(){
    this.answered=true;
    this.removeEventListeners();
    this.highlightCorrectAnswer();
    // removeevent lis is the same !?
    document
.querySelectorAll(".answer-btn")
.forEach(btn=>{
    btn.classList.add("disabled");
});
    this.container.innerHTML+=`
    <div class="time-up-message">
      <i class="fa-solid fa-clock"></i> TIME'S UP!
    </div>`
    setTimeout(() => {
      this.animateQuestion()
    }, 1000);
  }
  
  
  // ? Create checkAnswer(choiceElement) method
  // 1. If already answered, return early
  // 2. Set answered = true
  // 3. Stop the timer
  // 4. Get selected answer from data-answer attribute
  // 5. Compare with correctAnswer (case insensitive)
  // 6. If correct: add 'correct' class, call quiz.incrementScore()
  // 7. If wrong: add 'wrong' class, call highlightCorrectAnswer()
  // 8. Disable other buttons (add 'disabled' class)
  // 9. Call animateQuestion()
  checkAnswer(choiceElement){
    if(this.answered)return;
    this.answered =true;
    this.stopTimer();
    this.removeEventListeners();
    if(choiceElement.dataset.answer.toLowerCase() === this.correctAnswer.toLowerCase()){
      choiceElement.classList.add("correct");
      this.quiz.incrementScore();
      correctSound.currentTime = 0;
correctSound.play();
    }
    else{
      choiceElement.classList.add("wrong");
      this.highlightCorrectAnswer();
      wrongSound.currentTime = 0;
wrongSound.play();
    }
  document.querySelectorAll(".answer-btn").forEach(button=>{
     if (button !== choiceElement) {
            button.classList.add("disabled");
        }
  })
  this.animateQuestion(500);
}
  
  
  //? Create highlightCorrectAnswer() method
  // Find the button with correct answer and add 'correct-reveal' class
  highlightCorrectAnswer(){
    let buttons = document.querySelectorAll(".answer-btn");
    buttons.forEach(btn =>{
      if(btn.dataset.answer.toLowerCase() === this.correctAnswer.toLocaleLowerCase() ){
        btn.classList.add("correct-reveal")
      }
    })

  }
  
  
  // ? Create getNextQuestion() method
  // 1. Call quiz.nextQuestion()
  // 2. If returns true: create new Question and display it
  // 3. If returns false: show results using quiz.endQuiz()
  //    Also add click listener to Play Again button
  getNextQuestion(){
    if(this.quiz.nextQuestion()){
      const q = new Question(this.quiz,
            this.container,
            this.onQuizEnd);
            q.displayQuestion();
    }else{
      this.container.innerHTML =
    this.quiz.endQuiz();

    const restartBtn = document.querySelector(".btn-restart");

if (restartBtn) {
    restartBtn.addEventListener("click", () => {
        this.onQuizEnd();
    });
}
    }
    

  }
  
  
  // ? Create animateQuestion(duration) method
  // 1. Wait for 1500ms (transition delay)
  // 2. Add 'exit' class to question card
  // 3. Wait for duration
  // 4. Call getNextQuestion()
  animateQuestion(duration = 500) {

    setTimeout(() => {
        const card = document.querySelector(".question-card");
        if (card) {
            card.classList.add("exit");
        }
        setTimeout(() => {
            this.getNextQuestion();
        }, duration);
    }, 1500);
}

}
