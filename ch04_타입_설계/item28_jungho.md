# 아이템 28 유효한 상태만 표현하는 타입을 지향하기

> 유효한 상태만 표현한다는 것은 특정 상태를 관리할 때 **사용되는(유효한) 속성**들만 갖도록 표현하라는 것이다.
상태에 대한 타입 설계를 명확히 하지 않으면 분기문이 복잡해지거나, 분기문 내에서 유효한 상태를 놓치는 경우가 생길 수 있기 때문이다.
> 
- 유효한 상태와 무효한 상태 모두 표현하는 타입은 예측 가능성이 떨어지고 오류를 초래하기 쉽다.
- 유효한 상태만 표현하는 타입을 지향하면 코드가 길어지거나 표현이 어려울 수는 있지만 결론적으로 유지보수를 용이하게 한다.

<br/>

만약 응답에 대한 **로딩상태, 에러, 성공**을 관리하는 상태가 있다고 가정한다면 아래와 같은 형태일 것이다.

```tsx
interface state {
  isLoading: boolean;
  error: boolean;
  data: string;
}
```

위와 같은 형태도 어색하지는 않다 말 그대로 상태를 관리하는 것이니 로딩 성공 여부와 에러 발생 여부 성공 데이터가 담겨있는 형태이기 때문에 추상화는 잘못되었다고 표현할 수 없다.

하지만 이렇게 되면 케이스 분기 처리가 복잡해질 수 있다.

때문에 아래와 같이 작성한다면 상태를 정의하는 코드는 길어지겠지만 분기 처리가 용이하다.

```tsx
// 이렇게만 상태를 나누고 이에 따른 함수를 작성하기보다.
interface State {
  pageText: string;
  isLoading: boolean;
  error?: string;
}

function renderpage(state: State) {
  if (state.error) {
    return `Error! Unable to load ${currentpage}: ${state.error}`;
  } else if (state.isLoading) {
    return `Loading ${currentPage}...`;
  }
  return `<h1>${currentPage}</h1>\n${state.pageText}`;
} // 분기조건이 명확하지 않다. error값이 존재하면서 로딩중인 상태일 수도 있음.

// 이렇게 무효한 상태를 허용하지 않도록 코드가 길어지더라도 명시적으로 모델링하는 것이 좋다.
// 그 이후 이에따른 함수 작성
interface RequestPending {
  state: 'pending';
}

interface RequestError {
  state: 'error';
  error: string;
}

interface RequestSuccess {
  state: 'ok';
  data: string;
}

type RequestState = RequestPending | RequestError | RequestSuccess;

interface State {
  currentPage: string;
  requests: { [page: string]: RequestState };
}

function renderPage(state: State) {
  const { currentPage } = state;
  const requestState = state.requests[currentPage];

  switch (requestState.state) {
    case 'pending':
      return `Loading ${currentPage}...`;
    case 'error':
      return `Error! Unable to load ${currentPage}: ${requestState.error}`;
    case 'ok':
      return `<h1>${currentPage}</h1>\n${requestState.data}`;
  }
}
```