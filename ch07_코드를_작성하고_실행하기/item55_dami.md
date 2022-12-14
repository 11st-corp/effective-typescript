# 아이템 55. DOM 계층 구조 이해하기

타입스크립트에서는 DOM 엘리먼트의 계층 구조를 파악하기 용이합니다. `Element`와 `EventTarget`에 달려 있는 Node의 구체적인 타입을 안다면 타입 오류를 디버깅할 수 있고, 언제 타입 단언을 사용해야 할지 알 수 있습니다.

<img src ="https://ko.javascript.info/article/basic-dom-node-properties/dom-class-hierarchy.svg">

(출처: https://ko.javascript.info/basic-dom-node-properties)

`HTMLInputElement`는 `HTMLElement`의 서브타입이고, `HTMLElement`는 `Element`의 서브타입입니다. 또한 `Element`는 `Node`의 서브타입이고, `Node`는 `EventTarget`의 서브타입입니다.

## 계층 구조별 타입

### EventTarget

- DOM 타입 중 가장 추상화된 타입입니다.
- 이벤트 리스터를 추가하거나 제거하고, 이벤트를 보내는 것만 할 수 있습니다.

```typescript
function handleDrag(eDown: Event) {
  const targetEl = eDown.currentTarget;
  targetEl.classList.add("dragging");
  // ~~~~~~~           객체가 'null'인 것 같습니다.
  //         ~~~~~~~~~ 'EventTarget' 형식에 'classList' 속성이 없습니다.
  // ...
}
```

- `currentTarget` 속성의 타입은 `EventTarget | null` 입니다.
- `EventTarget` 타입에 `classList` 속성이 없습니다.

### Node

- `Element`가 아닌 `Node`인 경우 예시 : 텍스트 조각, 주석

```html
<p>
  And <i>yet</i> it move
  <!-- quote from Galileo -->
</p>
```

- `<p>` 는 `HTMLParagraphElement` 이며, `children`과 `childNodes` 속성을 가지고 있습니다.
- `children`은 자식 엘리먼트 `<i>yet</i>` 를 포함하는 `HTMLCollection`입니다.

### Element, HTMLElement

- `SVGElemen`t: `SVG 태그`의 전체 계층 구조를 포함하면서 `HTML`이 아닌 엘리먼트입니다.
- `<html>`은 HTMLhtmlElement, `<svg>`는 SVGElement 입니다.

### HTMLxxxElement

- 자신만의 고유한 속성을 가지고 있습니다.

  - `HTMLImageElement`에는 `src` 속성
  - `HTMLInputElemnt`에는 `value` 속성

- 속성에 접근하려면, 타입 정보 역시 실제 엘리먼트 타입이어야 합니다.
- 보통은 HTML 태그 값에 해당하는 'button'같은 리터럴 값을 사용하여 DOM에 대한 정확한 타입을 얻을 수 있습니다.

```typescript
document.getElementsByTagName("p")[0]; // HTMLParagraphElement
document.createElement("button"); // HTMLButtonElement
document.querySelector("div"); // HTMLDivElement
```

하지만 항상 정확한 타입을 얻을 수 있는 것은 아닙니다.

```typescript
document.getElementById("my-div"); // HTMLElement
```

위 예시는 HTMLElement로 추론을 하고 있는데, 이 경우는 우리가 더 정확한 타입을 알고 있는 경우이므로 단언문을 사용해도 됩니다.

```typescript
document.getElementById("my-div") as HTMLDivElement;
```

## Event 타입

Event는 가장 추상화된 이벤트입니다. 더 구체적인 타입들은 다음과 같습니다.

- `UIEvent`: 모든 종류의 사용자 인터페이스 이벤트
- `MouseEvnet`: 클릭처럼 마우스로부터 발생되는 이벤트
- `TouchEvent`: 모바일 기기의 터치 이벤트
- `WheelEvent`: 스크롤 휠을 돌려서 발생되는 이벤트
- `KeyboardEvent`: 키 누름 이벤트

### Event 관련 오류 예시

```typescript
function handleDrag(eDown: Event) {
  // ...
  const dragStart = [eDown.clientX, eDown.clientY];
  // ~~~~~~~                'Event'에 'clientX' 속성이 없습니다.
  //                ~~~~~~~ 'Event'에 'clientY' 속성이 없습니다.
  // ...
}
```

`clientX`와 `clientY`에서 발생한 오류는 handleDrag 함수의 매개변수는 `Event`로 선언된 반면 `clientX`와 `clientY`는 구체적인 `MouseEvent` 타입에 있기 때문입니다.

### Event 관련 오류 해결

DOM에 대한 타입 추론은 문맥 정보를 폭넓게 활용합니다.(아이템 26).

1.  `mousedown` 이벤트 핸들러를 인라인 함수로 만들기

    - 타입스크립트는 더 많은 문맥 정보를 사용하게 되고, 대부분의 오류를 제거할 수 있습니다.

2.  `Event` 대신 `MouseEvent`로 선언하기

```typescript
function addDragHandler(el: HTMLElement) {
  el.addEventListener("mousedown", (eDown) => {
    const dragStart = [eDown.clientX, eDown.clientY];
    const handleUp = (eUp: MouseEvent) => {
      el.classList.remove("dragging");
      el.removeEventListener("mouseup", handleUp);
      const dragEnd = [eUp.clientX, eUp.clientY];
      console.log(
        "dx, dy = ",
        [0, 1].map((i) => dragEnd[i] - dragStart[i])
      );
    };
    el.addEventListener("mouseup", handleUp);
  });
}

const div = document.getElementById("surface");
if (div) {
  addDragHandler(div);
}
```

- 마지막 `if` 구문은 `#surface` 엘리먼트가 없는 경우를 체크합니다. 이때 해당 엘리먼트가 반드시 존재한다는 것을 알고 있다면, if 구문 대신 단언문(`addDragHandler(div!)`)을 사용할 수 있습니다.
  > 타입스크립트에서 변수 앞이 아닌, 뒤에 느낌표(!)를 사용하면 기발한 용도로 사용할 수 있는데, 피연산자가 Nullish(null이나 undefined) 값이 아님을 단언할 수 있다. 단언 연산자(Non-null assertion operator) 또는 확정 할당 어선셜(Definite Assignment Assertions) 라 부른다.

# 결론

- DOM 타입은 타입스크립트에서 중요한 정보이다.
- Node, Element, HTMLElement, EventTarget 간의 차이점, Event와 MouseEvent의 차이점을 알아야 한다.
