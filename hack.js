'use strict';

(() => {
    const retrieveRoomHash = () => {
        const container = document.querySelector('div.screen-container');
        if (!container) throw new Error('Could not retrieve roomHash');
        return container.__vue__.$store.state._vm.currentId;
    };

    const checkOptions = (quizData) => {
        const options = document.querySelectorAll('ioner-comp.pop > div > div.page > div.quiz-component > div.quiz-content > div.t-component > div > div > div.options-container');
        options.forEach(option => {
            const dot = document.createElement('div');
            dot.classList.add('dot'); // Assuming you have CSS for this class to style the dot
            if (Array.isArray(quizData.structure.options) && quizData.structure.options.length > 0) {
                const optionData = quizData.structure.options.find(data => data.actualIndex === option.__vue__.optionData.actualIndex);
                if (optionData) {
                    option.innerHTML = ''; // Clear previous content
                    option.appendChild(dot); // Append the dot
                }
            } else if (typeof quizData.structure.options === 'number') {
                if (option.__vue__.optionData.actualIndex === quizData.structure.options) {
                    option.innerHTML = ''; // Clear previous content
                    option.appendChild(dot); // Append the dot
                }
            }
        });
    };

    const fetchData = async () => {
        console.log('%c \n    Scritp created by gbaranski#5119\n    Transition:\n    https://github.com/gbaranski/quizizz-cheat\n', 'color:red;');
        const response = await fetch('https://quizizz.com/_api/main/game/' + retrieveRoomHash());
        return await response.json();
    };

    new Promise((resolve, reject) => {
        function handle(result) {
            try {
                iterate(fetchGenerator.next(result));
            } catch (e) {
                reject(e);
            }
        }

        function iterate(result) {
            if (result.done) {
                resolve(result.value);
                return;
            }
            const promise = result.value;
            if (promise instanceof Promise) {
                promise.then(handle).catch(e => reject(e));
            } else {
                iterate(fetchGenerator.next(promise));
            }
        }

        const fetchGenerator = (function* () {
            yield fetchData();
        })();

        iterate(fetchGenerator.next());
    })()
        .then(data => {
            const { roomHash } = retrieveRoomHash();
            let lastRoomHash;
            setInterval(() => {
                const { roomHash, playerId, quizId, roomCode, questionID } = retrieveRoomHash();
                if (roomHash !== lastRoomHash) {
                    for (let i = 0; i < data.game.questions.length; i++) {
                        const question = data.game.questions[i];
                        if (roomHash === question._id) {
                            console.log({ q: question });
                            checkOptions(question);
                            lastRoomHash = roomHash;
                        }
                    }
                }
            }, 500);
        })
        .catch(error => console.error('Could not retrieve quiz data', error));
})();
