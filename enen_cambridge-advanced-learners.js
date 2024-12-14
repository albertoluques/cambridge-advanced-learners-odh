class CambridgeDictionary {
    constructor() {
        // Constructor logic, if any, goes here.
    }

    findTerm(word) {
        return new Promise((resolve, reject) => {
            // Your code to fetch and process the term from the Cambridge Dictionary
            const baseUrl = 'https://dictionary.cambridge.org/dictionary/english/';
            const url = baseUrl + encodeURIComponent(word);

            fetch(url)
                .then(response => response.text())
                .then(data => {
                    let notes = this.parseCambridgeDictionary(data);
                    resolve(notes);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    parseCambridgeDictionary(html) {
        let notes = [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const dictionary = doc.querySelector('.entry-body__el');
        if (!dictionary) return notes;

        const expression = this.getText(dictionary.querySelector('.headword'));
        const reading = this.getText(dictionary.querySelector('.pron .ipa'));

        const audios = this.extractAudioLinks(dictionary);
        const definitions = this.extractDefinitions(dictionary);

        let css = this.renderCSS();

        notes.push({
            css,
            expression,
            reading,
            definitions,
            audios
        });

        return notes;
    }

    getText(node) {
        return node ? node.innerText.trim() : '';
    }

    extractAudioLinks(dictionary) {
        const audios = [];
        const audioElements = dictionary.querySelectorAll('a.sound');
        audioElements.forEach(audio => {
            const audioSrc = audio.dataset.srcMp3;
            if (audioSrc) audios.push(audioSrc);
        });
        return audios;
    }

    extractDefinitions(dictionary) {
        const definitions = [];
        const definitionBlocks = dictionary.querySelectorAll('.def');
        definitionBlocks.forEach(defBlock => {
            let definitionText = this.getText(defBlock);
            if (definitionText) {
                definitions.push(`<span class='def'>${definitionText}</span>`);
            }
        });
        return definitions;
    }

    renderCSS() {
        let css = `
            <style>
                span.pos { font-size: 0.9em; font-weight: bold; }
                span.def { font-size: 1em; margin-bottom: 5px; }
                ul.sents { font-size: 0.8em; list-style:square inside; margin:5px 0;padding:5px; background:rgba(0,0,0,0.1); border-radius:5px;}
                li.sent { margin: 0; padding: 0; }
                span.eng_sent { margin-right:5px;}
            </style>
        `;
        return css;
    }
}
