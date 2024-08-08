let display = true;

const searchInput = document.querySelector("#search-input");
searchInput.addEventListener("input", searchInputListener);

document.addEventListener("click", handleArticleVisibility);

function searchInputListener() {
    const chooseYourMasterArticle = document.querySelector(
        ".choose-your-master-article");
    chooseYourMasterArticle.style.display = "block";
    scrollToTop();

    const searchValue = searchInput.value.toLowerCase();

    const masterList = document.querySelector("#master-list");
    const masterItems = masterList.querySelectorAll("#master-list > li");

    masterItems.forEach((masterItem) => {
        const masterName = masterItem.querySelector(
            "li:nth-child(2)").textContent.toLowerCase();
        if (masterName.includes(searchValue)) {
            masterItem.style.display = "block";
        } else {
            masterItem.style.display = "none";
        }
    });
}

function scrollToTop() {
    window.scrollTo(0, 0);
}

function sendButtonListener() {
    return async (e) => {
        const ALERT_MASTER_NOT_SELECTED = "마스터를 선택해주세요.";
        const ALERT_WRONG_INPUT = "정답 혹은 시작을 입력해주세요.";
        const WAITING_MESSAGE = "잠시만 기다려주세요...";
        const allowedInput = ["시작", "1", "2", "3", "4"];

        e.preventDefault();

        const selectedRadio = document.querySelector(
            'input[name="master-selected"]:checked');

        if (!selectedRadio) {
            alert(ALERT_MASTER_NOT_SELECTED);
            return;
        }

        const message = document.querySelector("#chat-input").value;
        document.querySelector("#chat-input").value = "";

        if (!message || message.trim() === ""
            || !allowedInput.includes(message)) {
            alert(ALERT_WRONG_INPUT);
            document.querySelector("#chat-input").focus();
            return;
        }

        const chatHistory = document.querySelector(".chat-history-section");
        chatHistory.appendChild(makeClientChat(message));
        scrollToBottom();

        document.querySelector("#chat-input").disabled = true;

        chatHistory.appendChild(makeMasterChat(WAITING_MESSAGE,));
        scrollToBottom();

        const response = await getChatResponse(message);

        chatHistory.removeChild(chatHistory.lastChild);

        chatHistory.appendChild(makeMasterChat(response));
        scrollToBottom();

        document.querySelector("#chat-input").disabled = false;
        document.querySelector("#chat-input").focus();
    };
}

function scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
}

function makeClientChat(message) {
    const newClientChatHistory = document.createElement("pre");
    newClientChatHistory.classList.add("client-chat-history");

    const clientChatIcon = document.createElement("i");
    clientChatIcon.classList.add("bi", "bi-person-circle");

    const clientChat = document.createElement("p");
    clientChat.classList.add("client-chat");
    clientChat.textContent = message;

    newClientChatHistory.appendChild(clientChat);
    newClientChatHistory.appendChild(clientChatIcon);
    return newClientChatHistory;
}

async function getChatResponse(message) {
    const masterSelected = document.querySelector(
        'input[name="master-selected"]:checked').parentElement;
    const masterName = masterSelected.querySelector(
        "li:nth-child(2)").textContent;

    const data = await getMasterData(masterName)

    const prompt = makePrompt(data, message);

    const response = await getLLMResponse(prompt)
    return response.choices[0].message.content;
}

function getLLMResponse(prompt) {
    const REJECT_MESSAGE = "요청에 실패했습니다.";
    return fetch('https://open-api.jejucodingcamp.workers.dev/',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(prompt)
        }).then((res) => {
        if (!res.ok) {
            return REJECT_MESSAGE;
        }

        return res.json()
    });
}

function getMasterData(masterName) {
    return fetch(`./data/master-info.json`)
    .then((res) => res.json())
    .then((data) => {
        return data.find((master) => master.name === masterName);
    });
}

function makePrompt(data, message) {
    const systemRole = `당신은 ${data["expert"]} 객관식 퀴즈 출제자 ${data["name"]}.퀴즈를 내주고 유저가 맞추면 다음 퀴즈를 알려주고 아니면 해설과 함게 알려주고 다음 퀴즈를 낸다.
    응답을 pre 테그에 넣을 수 있도록 해주세요. pre테그는 제외 하고 내용만 보내주세요.
     [형식]:
        [마스터 이름]:
        
        맞으면 축가해준다.
            
        or   
            
        틀렸습니다.
        해설: [해설 내용]
         
        퀴즈 [번호]: [퀴즈 내용]
        
        1. [선택1]
        2. [선택2]
        3. [선택3]
        4. [선택4]
        
        정답을 입력해 주세요!
    `;

    const prompt = [{"role": "system", "content": systemRole},]

    const masterChats = document.querySelectorAll(".master-chat");
    if (masterChats.length > 1) {
        const clientChats = document.querySelectorAll(".client-chat");
        const lastClientChatContent = clientChats[clientChats.length
        - 1].textContent;
        prompt.push({"role": "user", "content": lastClientChatContent});

        const lastMasterChatContent = masterChats[masterChats.length
        - 2].textContent;
        prompt.push({"role": "assistant", "content": lastMasterChatContent});
    }

    prompt.push({"role": "user", "content": message});
    return prompt;
}

function makeMasterChat(message) {
    console.log(message);
    const newMasterChatHistory = document.createElement("div");
    newMasterChatHistory.classList.add("master-chat-history");

    const masterIcon = document.createElement("img");
    masterIcon.classList.add("master-icon");
    masterIcon.src = document.querySelector(".master-icon").src;
    newMasterChatHistory.appendChild(masterIcon);

    const masterChat = document.createElement("pre");
    masterChat.classList.add("master-chat");
    masterChat.textContent = message;
    newMasterChatHistory.appendChild(masterChat);
    return newMasterChatHistory;
}

function renderMasters() {
    fetch("./data/master-info.json")
    .then((res) => res.json())
    .then((data) => makeMasterList(data));
}

function makeMasterList(mastersInfo) {
    const masterList = document.querySelector("#master-list");
    masterList.innerHTML = "";

    mastersInfo.forEach((master) => {
        const masterItem = document.createElement("li");
        masterItem.appendChild(makeMasterItem(master));
        masterItem.appendChild(makeMasterRadio(master));
        masterItem.appendChild(makeMasterLabel(master));
        masterList.appendChild(masterItem);
    });
}

function makeMasterItem(master) {
    const masterInfoItem = document.createElement("ul");

    const masterImgInfo = document.createElement("li");
    const masterImg = document.createElement("img");
    masterImg.src = master.image;
    masterImg.alt = master.name;
    masterImgInfo.appendChild(masterImg);

    const masterName = document.createElement("li");
    masterName.textContent = master.name;

    const masterExpert = document.createElement("li");
    masterExpert.textContent = `Quiz about ${master.expert}`;

    const masterRating = document.createElement("li");
    for (let i = 0; i < master.rating; i++) {
        const star = document.createElement("i");
        star.classList.add("bi", "bi-star-fill");
        masterRating.appendChild(star);
    }

    masterInfoItem.appendChild(masterImgInfo);
    masterInfoItem.appendChild(masterName);
    masterInfoItem.appendChild(masterExpert);
    masterInfoItem.appendChild(masterRating);
    return masterInfoItem;
}

function makeMasterRadio(master) {
    const masterRadio = document.createElement("input");
    masterRadio.type = "radio";
    masterRadio.name = "master-selected";
    masterRadio.id = master.name;
    masterRadio.value = master.name;
    masterRadio.classList.add("choose-your-master-input")
    masterRadio.addEventListener("change", initChat());
    return masterRadio;
}

function initHistorySection(masterImg, masterName) {
    const HISTORY_TITLE = "퀴즈 기록";
    const MASTER_CHAT = "퀴즈 풀기를 시작하려면 시작을 입력하세요.";

    const chatHistorySection = document.createElement("article");
    chatHistorySection.classList.add("chat-history-section");

    const masterChatHistoryTitle = document.createElement("h2");
    masterChatHistoryTitle.textContent = HISTORY_TITLE;
    chatHistorySection.appendChild(masterChatHistoryTitle);

    const masterChatHistory = document.createElement("div");
    masterChatHistory.classList.add("master-chat-history");
    const masterIcon = document.createElement("img");
    masterIcon.classList.add("master-icon");
    masterIcon.src = masterImg;
    masterIcon.alt = masterName;
    masterChatHistory.appendChild(masterIcon);

    const masterChat = document.createElement("pre");
    masterChat.classList.add("master-chat");
    masterChat.textContent = MASTER_CHAT;
    masterChatHistory.appendChild(masterChat);
    chatHistorySection.appendChild(masterChatHistory);

    return chatHistorySection;
}

function initMessageForm(messageForm) {
    const INIT_HEADER_TEXT = "문의사항 입력";
    const INIT_LABEL_TEXT = "정답 입력창";
    const INIT_PLACEHOLDER = "정답을 입력하세요";
    const INIT_INPUT_ID = "chat-input";

    messageForm.classList.add("message-form");

    const header = document.createElement("h3");
    header.textContent = INIT_HEADER_TEXT;
    messageForm.appendChild(header);

    const label = document.createElement("label");
    label.htmlFor = INIT_INPUT_ID;
    label.classList.add("message-input-label");
    label.textContent = INIT_LABEL_TEXT;

    const input = document.createElement("input");
    input.type = "text";
    input.id = INIT_INPUT_ID;
    input.placeholder = INIT_PLACEHOLDER;

    const button = document.createElement("button");
    button.type = "submit";
    button.classList.add("send-button");

    const icon = document.createElement("i");
    icon.classList.add("bi", "bi-send");
    button.appendChild(icon);

    messageForm.appendChild(label);
    messageForm.appendChild(input);
    messageForm.appendChild(button);
}

function handleArticleVisibility() {
    if (document.activeElement !== searchInput) {
        const chooseYourMasterArticle = document.querySelector(
            ".choose-your-master-article");
        if (display) {
            chooseYourMasterArticle.style.display = "block";
        } else {
            chooseYourMasterArticle.style.display = "none";
        }
        searchInput.value = "";
        const masterItems = document.querySelectorAll("#master-list > li");

        masterItems.forEach((masterItem) => {
            masterItem.style.display = "block";
        });
    }
}

function displayMasterInfo(masterName, masterExpert) {
    const header = document.querySelector("header");
    const oldSelectedMaster = document.querySelector(".selected-master");
    if (oldSelectedMaster) {
        header.removeChild(oldSelectedMaster);
    }

    const selectedMaster = document.createElement("ul");
    selectedMaster.classList.add("selected-master");

    const masterNameLi = document.createElement("li");
    masterNameLi.textContent = masterName;
    selectedMaster.appendChild(masterNameLi);

    const masterExpertLi = document.createElement("li");
    masterExpertLi.textContent = masterExpert;
    selectedMaster.appendChild(masterExpertLi);

    header.appendChild(selectedMaster);
}

function initChat() {
    return async () => {
        const chooseYourMasterArticle = document.querySelector(
            ".choose-your-master-article");
        chooseYourMasterArticle.style.display = "none";
        display = false;

        const oldMessageInputSection = document.querySelector(".message-form");
        if (oldMessageInputSection) {
            oldMessageInputSection.remove();
        }

        const oldChatHistorySection = document.querySelector(
            ".chat-history-section");
        if (oldChatHistorySection) {
            oldChatHistorySection.remove();
        }

        const selectedRadio = document.querySelector(
            'input[name="master-selected"]:checked');
        const masterSelected = selectedRadio.parentElement;
        const masterName = masterSelected.querySelector(
            "li:nth-child(2)").textContent;
        const masterImg = masterSelected.querySelector("img").src;
        const masterExpert = masterSelected.querySelector(
            "li:nth-child(3)").textContent;

        displayMasterInfo(masterName, masterExpert);

        const main = document.querySelector("main")
        const chatHistorySection = initHistorySection(masterImg, masterName);
        main.appendChild(chatHistorySection);

        const messageForm = document.createElement("form");
        initMessageForm(messageForm);
        main.appendChild(messageForm);

        const sendButton = document.querySelector(".message-form > button")
        sendButton.addEventListener("click", sendButtonListener());
    };
}

function makeMasterLabel(master) {
    const MASTER_LABEL_TEXT = "선택";
    const masterLabel = document.createElement("label");
    masterLabel.htmlFor = master.name;
    masterLabel.textContent = MASTER_LABEL_TEXT;
    masterLabel.classList.add("choose-master-label")
    return masterLabel;
}

renderMasters();
