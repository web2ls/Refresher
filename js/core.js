window.onload = function() {
  const introduceText = document.querySelector('.introduce');
  const dictionary = document.querySelector('.dictionary');
  const addNewWord = document.querySelector('.add-new-word');
  const test = document.querySelector('.test');
  const dictionaryBtn = document.querySelector('.dictionary-btn');
  const addNewWordBtn = document.querySelector('.add-new-word-btn');
  const testBtn = document.querySelector('.test-btn');
  const showRightAnswerBtn = document.querySelector('.show-right-answer-btn');
  const showNextWordBtn = document.querySelector('.show-next-word-btn');
  const newWordForm = document.querySelector('.new-word-form');
  const wordsList = document.querySelector('.words-list');
  const translateWord = document.querySelector('.translate-word');
  const testWord = document.querySelector('.test-word');
  const translatedWord = document.querySelector('.translated-word');
  let currentTestedWord = '';
  let lexicon = [];
  let currentScreen = 'introduce';

  const config = {
    apiKey: "AIzaSyDWjI8cK8rE-zDf3sRVKMLugxFrucvCzCE",
    authDomain: "refresher-84db1.firebaseapp.com",
    databaseURL: "https://refresher-84db1.firebaseio.com"
  };
  firebase.initializeApp(config);
  const database = firebase.database();

  function toggleIntroduce() {
    introduceText.classList.toggle('introduce-visible');
    const introduceTimer = setInterval(function() {
      introduceText.classList.toggle('introduce-visible');
    }, 3000);
  };

  function getInitialData() {
    lexicon = [];
    database.ref('dictionary').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      for (let key in data) {
        lexicon.push(data[key]);
      };
    })
  };

  function createDictionaryHtml() {
    const dictionaryHtml = lexicon.map((item, i) => {
      return `<li data-id='${item.id}'>${item.value}</li>`
    }).join('');
    wordsList.innerHTML = dictionaryHtml;
  };

  function showDictionaryScreen() {
    test.style.display = 'none';
    introduceText.style.display = 'none';
    addNewWord.style.display = 'none';
    dictionary.style.display = 'flex';
    createDictionaryHtml();
  };

  function showTranslation(event) {
    const wordId = event.target.getAttribute('data-id');
    const word = lexicon.filter(item => item.id === parseInt(wordId));
    translateWord.textContent = word[0].translation;
  };

  function showAddNewWordScreen() {
    addNewWord.style.display = 'block';
    introduceText.style.display = 'none';
    dictionary.style.display = 'none';
    test.style.display = 'none';
  };

  function saveNewWord(event) {
    event.preventDefault();
    const newEnglishWord = this.querySelector('.new-english-word').value;
    const newTranslateWord = this.querySelector('.new-translate-word').value;
    const newWord = {
      id: new Date().getTime(),
      value: newEnglishWord.toString().toLowerCase(),
      translation: newTranslateWord.toString().toLowerCase()
    };
    database.ref('dictionary/' + newWord.id).set(newWord);
    getInitialData();
    alert('Новое слово внесено в словарь');
    this.querySelector('.new-english-word').value = '';
    this.querySelector('.new-translate-word').value = '';
  };

  function getRandomWord() {
    const randomWordId = Math.floor(Math.random() * lexicon.length);
    return currentTestedWord = lexicon.filter((item, i) => i === randomWordId);
  };

  function showTestScreen() {
    addNewWord.style.display = 'none';
    introduceText.style.display = 'none';
    dictionary.style.display = 'none';
    test.style.display = 'block';

    testWord.textContent = getRandomWord()[0].value;
    translatedWord.textContent = '';
  };

  function showRightAnswer() {
    translatedWord.textContent = currentTestedWord[0].translation;
  };

  function showNextWord() {
    testWord.textContent = getRandomWord()[0].value;
    translatedWord.textContent = '';
  };

  function keyboardControl(event) {
    if (!(test.style.display === 'block')) return;

    if (!(event.keyCode === 32 || event.keyCode === 84)) return;

    if (event.keyCode === 32) {
      showNextWord();
    } else {
      showRightAnswer();
    }
  };

  dictionaryBtn.addEventListener('click', showDictionaryScreen);
  addNewWordBtn.addEventListener('click', showAddNewWordScreen);
  testBtn.addEventListener('click', showTestScreen);
  newWordForm.addEventListener('submit', saveNewWord);
  showRightAnswerBtn.addEventListener('click', showRightAnswer);
  showNextWordBtn.addEventListener('click', showNextWord);
  wordsList.addEventListener('click', showTranslation);

  window.addEventListener('keyup', keyboardControl);

  getInitialData();

  toggleIntroduce();

};
