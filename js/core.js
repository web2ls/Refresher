window.onload = function() {
  const introduceText = document.querySelector('.introduce');
  const dictionary = document.querySelector('.dictionary');
  const addNewWord = document.querySelector('.add-new-word');
  const test = document.querySelector('.test');
  const dictionaryBtn = document.querySelector('.dictionary-btn');
  const addNewWordBtn = document.querySelector('.add-new-word-btn');
  const testBtn = document.querySelector('.test-btn');
  const toLearnedBtn = document.querySelector('.to-learned-btn');
  const toNewBtn = document.querySelector('.to-new-btn');
  const deleteWordBtn = document.querySelector('.delete-word-btn');
  const showRightAnswerBtn = document.querySelector('.show-right-answer-btn');
  const showNextWordBtn = document.querySelector('.show-next-word-btn');
  const newWordForm = document.querySelector('.new-word-form');
  const wordsList = document.querySelector('.words-list');
  const learnedWordsList = document.querySelector('.learned-words-list');
  const translateWord = document.querySelector('.translate-word');
  const testWord = document.querySelector('.test-word');
  const translatedWord = document.querySelector('.translated-word');
  let currentTestedWord = '';
  let lexicon = [];
  let learnedLexicon = [];
  let currentScreen = 'introduce';
  let currentSelectedWord = '';
  let currentSelectedLearnedWord = '';
  let isWordSelected = false;
  let isLearnedWordSelected = false;

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
    learnedLexicon = [];
    database.ref('dictionary').once('value')
    .then(snapshot => {
      const data = snapshot.val();
      for (let key in data) {
        lexicon.push(data[key]);
      };
    });

    database.ref('learnedDictionary').once('value')
    .then(snapshot => {
      const learnedData = snapshot.val();
      for (let key in learnedData) {
        learnedLexicon.push(learnedData[key]);
      };
    });
  };

  function createDictionaryHtml() {
    const dictionaryHtml = lexicon.map((item, i) => {
      return `<li data-id='${item.id}'>${item.value}</li>`
    }).join('');
    wordsList.innerHTML = dictionaryHtml;
  };

  function createLearnedDictionaryHtml() {
    const learnedDictionaryHtml = learnedLexicon.map((item, i) => {
      return `<li data-id='${item.id}'>${item.value}</li>`
    }).join('');
    learnedWordsList.innerHTML = learnedDictionaryHtml;
  };

  function getSelectedLearnedWord(event) {
    if (event.target.nodeName !== 'LI') return;
    const wordId = event.target.getAttribute('data-id');
    currentSelectedLearnedWord = learnedLexicon.filter(item => item.id === parseInt(wordId));

    const allLearnedWords = document.querySelectorAll('.learned-words-list li');
    allLearnedWords.forEach(item => {
      if (item.classList.contains('selected-word')) {
        item.classList.remove('selected-word');
      }
    });
    event.target.classList.add('selected-word');
    isLearnedWordSelected = true;

    const allWords = document.querySelectorAll('.words-list li');
    allWords.forEach(item => item.classList.remove('selected-word'));
    isWordSelected = false;
  };

  function showDictionaryScreen() {
    test.style.display = 'none';
    introduceText.style.display = 'none';
    addNewWord.style.display = 'none';
    dictionary.style.display = 'flex';
    createDictionaryHtml();
    createLearnedDictionaryHtml();
  };

  function showTranslation(event) {
    if (event.target.nodeName !== 'LI') return;
    const wordId = event.target.getAttribute('data-id');
    const word = lexicon.filter(item => item.id === parseInt(wordId));
    translateWord.textContent = word[0].translation;
    currentSelectedWord = word;
    const allWords = document.querySelectorAll('.words-list li');
    allWords.forEach(item => {
      if (item.classList.contains('selected-word')) {
        item.classList.remove('selected-word');
      }
    });
    event.target.classList.add('selected-word');
    isWordSelected = true;

    const allLearnedWords = document.querySelectorAll('.learned-words-list li');
    allLearnedWords.forEach(item => item.classList.remove('selected-word'));
    isLearnedWordSelected = false;
  };

  function relocateWordToLearned() {
    if (!isWordSelected) return;
    const wordId = currentSelectedWord[0].id;
    learnedLexicon.push(currentSelectedWord[0]);
    lexicon = lexicon.filter(item => item.id !== wordId);
    createLearnedDictionaryHtml();
    createDictionaryHtml();
    database.ref('learnedDictionary/' + wordId).set(currentSelectedWord[0]);
    database.ref('dictionary/' + wordId).remove();
    isWordSelected = false;
  };

  function relocateWordToNew() {
    if (!isLearnedWordSelected) return;
    const wordId = currentSelectedLearnedWord[0].id;
    lexicon.push(currentSelectedLearnedWord[0]);
    learnedLexicon = learnedLexicon.filter(item => item.id !== wordId);
    createDictionaryHtml();
    createLearnedDictionaryHtml();
    database.ref('dictionary/' + wordId).set(currentSelectedLearnedWord[0]);
    database.ref('learnedDictionary/' + wordId).remove();
    isLearnedWordSelected = false;
  };

  function deleteWord() {
    if (isWordSelected) {
      const wordId = currentSelectedWord[0].id;
      lexicon = lexicon.filter(item => item.id !== wordId);
      createDictionaryHtml();
      isWordSelected = false;
      database.ref('dictionary/' + wordId).remove();
    } else if (isLearnedWordSelected) {
      const wordId = currentSelectedLearnedWord[0].id;
      learnedLexicon = learnedLexicon.filter(item => item.id !== wordId);
      createLearnedDictionaryHtml();
      isLearnedWordSelected = false;
      database.ref('learnedDictionary/' + wordId).remove();
    }
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
  toLearnedBtn.addEventListener('click', relocateWordToLearned);
  toNewBtn.addEventListener('click', relocateWordToNew);
  deleteWordBtn.addEventListener('click', deleteWord);
  learnedWordsList.addEventListener('click', getSelectedLearnedWord);

  window.addEventListener('keyup', keyboardControl);

  getInitialData();

  toggleIntroduce();

};
