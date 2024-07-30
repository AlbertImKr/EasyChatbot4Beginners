const sendButton = document.querySelector(".message-input-section > button")

// 입력한 내용 기반으로 채팅을 보내고 마스터에게 답변을 받는다
sendButton.addEventListener("click", sendButtonListener());

const searchInput = document.querySelector("#search-input");
searchInput.addEventListener("input", searchInputListener);

function searchInputListener() {
    const searchValue = searchInput.value.toLowerCase();

    const masterList = document.querySelector("#master-list");
    const masterItems = masterList.querySelectorAll("#master-list > li");
    console.log(masterItems);

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

function sendButtonListener() {
    return async (e) => {
        e.preventDefault();

        // 선택한 마스터를 가져오기
        const selectedRadio = document.querySelector(
            'input[name="master-selected"]:checked');

        // 선택된 마스터가 없으면 경고창 띄우기
        if (!selectedRadio) {
            alert("마스터를 선택해주세요.");
            return;
        }

        // 입력한 메시지를 가져오기
        const message = document.querySelector("#chat-input").value;
        // 채팅창 초기화
        document.querySelector("#chat-input").value = "";

        // 입력한 메시지가 없으면 경고창 띄우기
        if (!message || message.trim() === "") {
            alert("메시지를 입력해주세요.");
            return;
        }

        // 채팅 history에 메시지 추가하기
        const chatHistory = document.querySelector(".chat-history-section");
        chatHistory.appendChild(makeClientChat(message));

        // 답변 받기 전까지 더 이상 입력 못하게 하기
        document.querySelector("#chat-input").disabled = true;

        // 닫변 받기 전까지 요청하고 있다고 알리기
        chatHistory.appendChild(makeMasterChatHistory("잠시만 기다려주세요..."));

        // 마스터의 답변을 가져와서 채팅 history에 추가하기
        const response = await getChatResponse(message);

        // 답변 받은 후에 잠시만 기다려주세요... 메시지 삭제하기
        chatHistory.removeChild(chatHistory.lastChild);

        // 답변 받은 후에 채팅 history에 추가하기
        chatHistory.appendChild(makeMasterChatHistory(response));

        // 답변 받은 후에 다시 입력할 수 있게 하기
        document.querySelector("#chat-input").disabled = false;
    };
}

function makeClientChat(message) {
    const newClientChatHistory = document.createElement("div");
    newClientChatHistory.classList.add("client-chat-history");

    const clientChatIcon = document.createElement("i");
    clientChatIcon.classList.add("bi", "bi-person-circle");

    const clientChat = document.createElement("p");
    clientChat.classList.add("client-chat");
    clientChat.textContent = message;

    newClientChatHistory.appendChild(clientChatIcon);
    newClientChatHistory.appendChild(clientChat);
    return newClientChatHistory;
}

async function getChatResponse(message) {
    // 선택한 마스터의 이름을 가져온다
    const masterSelected = document.querySelector(
        'input[name="master-selected"]:checked').parentElement;
    const masterName = masterSelected.querySelector(
        "li:nth-child(2)").textContent;

    // 마스터의 이름으로 데이터를 가져온다
    const data = await getMasterData(masterName)

    // prompt를 만든다
    const prompt = makePrompt(data, message);

    // prompt를 사용하여 요청을 한다
    const response = await fetch('https://open-api.jejucodingcamp.workers.dev/',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(prompt)
        }).then((res) => {
        if (!res.ok) {
            return "요청에 실패했습니다.";
        }

        return res.json()
    })
    return response.choices[0].message.content;
}

function getMasterData(masterName) {
    return fetch(`./data/master-info.json`)
    .then((res) => res.json())
    .then((data) => {
        return data.find((master) => master.name === masterName);
    });
}

function makePrompt(data, message) {
    const systemRole = `당신은 ${data["expert"]} 전문가 입니다.너의 모든 지식은 ${data.links}사이트 기반으로 합니다.그 외의 지식은 모른다고 다른 마스터에게 물어보라고 해라.`;

    const prompt =
        [
            {"role": "system", "content": systemRole},
        ]

    // 만약 이전 답변이 있다면 이전 답변을 추가한다
    const masterChats = document.querySelectorAll(".master-chat");
    if (masterChats.length > 1) {
        const clientChats = document.querySelectorAll(".client-chat");
        const lastClientChatContent = clientChats[clientChats.length
        - 1].textContent;
        prompt.push({"role": "user", "content": lastClientChatContent});

        const lastMasterChatContent = masterChats[masterChats.length
        - 1].textContent;
        prompt.push({"role": "assistant", "content": lastMasterChatContent});
    }

    prompt.push({"role": "user", "content": message});
    return prompt;
}

function makeMasterChatHistory(message) {
    const newMasterChatHistory = document.createElement("div");
    newMasterChatHistory.classList.add("master-chat-history");

    const masterChatIcon = document.createElement("i");
    masterChatIcon.classList.add("bi", "bi-chat");

    const masterChat = document.createElement("p");
    masterChat.classList.add("master-chat");
    masterChat.textContent = message;

    newMasterChatHistory.appendChild(masterChat);
    newMasterChatHistory.appendChild(masterChatIcon);
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
    masterExpert.textContent = `Expert in ${master.expert}`;

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
    masterRadio.addEventListener("change", async () => {
        let chatHistory = document.querySelector(".chat-history-section");
        chatHistory.innerHTML = "";

        let sectionHeader = document.createElement("h3");
        sectionHeader.textContent = "채팅 history"
        chatHistory.appendChild(sectionHeader);

        let sayHello = makeMasterChatHistory("안녕하세요! 무엇을 도와드릴까요?");
        chatHistory.appendChild(sayHello);
    });
    return masterRadio;
}

function makeMasterLabel(master) {
    const masterLabel = document.createElement("label");
    masterLabel.htmlFor = master.name;
    masterLabel.textContent = "선택";
    masterLabel.classList.add("choose-master-label")
    return masterLabel;
}

renderMasters();
