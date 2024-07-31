# EasyChatbot4Beginners

## Python 초보자를 위한 Chatbot

- 목표

    - 초보자를 위한 퀴즈를 제공하는 ChatBot 서비스입니다.

## WBS(Work Breakdown Structure)

![WBS](https://github.com/user-attachments/assets/b9da7814-14eb-4ddd-8912-087e65e5fb69)

- [프로젝트 보드 보기](https://github.com/users/AlbertImKr/projects/3/views/2)

## 와이어프레임

![와이어프레임](https://github.com/user-attachments/assets/1b82a2e8-8772-411e-9908-50dd98e296ce)

- [Figma 주소](https://www.figma.com/design/Uzh16al5HdIt7pApcEh0rw/Visily-(Community)?node-id=0-1&t=NwnYITf6yJNRqjdp-1)

## 공개 주소

[주소](https://albertimkr.github.io/EasyChatbot4Beginners/)

## 시연

### 1. 마스터 검색이 가능합니다.

- `style= "display: none"`으로 속성으로 마스터를 숨겼습니다.
- `type="radio"` 속성으로 마스터를 하나만 선택할 수 있도록 설정했습니다.
- 마스터를 선택하면 채팅방으로 전환합니다.
- 마스터 정보는 JSON 파일에서 데이터를 가져와서 렌더링했습니다.

![마스터_선택_초기_화면](https://github.com/user-attachments/assets/8ccc29f5-b2a0-4ee7-8fbf-82861eebeeb8)

### 2. 마스터를 선택하면 채팅방 화면으로 전환합니다.

- 입력 값을 `1`, `2`, `3`, `4`, 시작으로 제한했습니다. 이 외의 문자가 입력될 경우 경고창이 표시됩니다.
- 선택한 마스터 정보를 가져와서 오른쪽 상단에 고정했습니다.
- 선택한 마스터 이미지를 가져와서 채팅 이미지로 사용했습니다
- 기다리는 동안 추가 입력을 방지하기 위해 disabled 속성을 사용하여 제한했습니다.

![퀴즈_진행](https://github.com/user-attachments/assets/8780011e-8e19-4a22-bf37-0c9c4418a4a7)

### 3. 채팅방 화면에서 마스터 검색 기능이 가능하며 마스터를 전환할 수 있습니다.

- 퀴즈 진행 중에도 검색창을 사용할 수 있도록 했습니다.
- 다른 마스터를 선택하지 않으면 마스터 리스트가 다시 숨겨집니다.

![유저_전환](https://github.com/user-attachments/assets/8b812908-7296-4f28-a563-d430c8ef25d1)

## 어려움 및 해결 과정

### 1. 채팅방 화면에서 마스터 리스트를 다시 표시하고 숨기는 기능

input 텍스트 변경 이벤트, input 텍스트 클릭 등 여러 이벤트를 고려했으나 모두 적합하지 않거나 충돌이 발생했습니다.

이를 해결하기 위해 전역 변수를 사용하여 마스터의 상태를 관리했습니다.

- 마스터를 선택하지 않은 상태에서는 전역 display 변수를 true로 설정했습니다.
- 마스터를 선택한 상태에서는 display 변수를 false로 설정하여 마스터 리스트를 숨깁니다.

검색창에 텍스트를 입력하면 리스트가 항상 표시되도록 하였습니다.
 
대신 document의 click 이벤트를 사용하여 document.activeElement 속성을 통해 현재 활성화된 요소가 input이 아닐 때 
전역 display 속성을 참조하여 searchInput 이외의 요소를 클릭하면 마스터 리스트를 숨기거나 표시하도록 구현했습니다.
