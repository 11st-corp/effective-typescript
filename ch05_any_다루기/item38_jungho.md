# 아이템38 any 타입은 가능한 한 좁은 범위에서만 사용하기

타입스크립트의 점진적인 특성을 가지는데, 이런 특성에 중요한 역할을 하는 것이 `any`타입이다.

`any`타입은 프로그램의 일부에만 타입체크를 비활성화 시킬 수 있기 때문에 점진적인 마이그레이션을 진행하는데 도움이 되기 때문이다.

하지만 강력한 만큼 남용할 소지가 높기 때문에 장점을 살리고 단점을 줄이는 방법들이 필요하며, 이 아이템에서는 `any` 타입을 좁은 범위에서 사용할 것을 권장한다.

<br/>

```tsx
interface Foo { foo: string; }
interface Bar { bar: string; }
declare function expressionReturningFoo(): Foo;
```

위의 타입 조건이 있고 `x`라는 변수가 있을 때, `x`가 동시에 `Foo` 타입과 `Bar` 타입에 할당 가능하다면, 어떻게 오류를 제거할 수 있을까?

<br/>

오류를 제거하는 방법으로 아래와 같이 두 가지 방법을 제시할 수 있다.

```tsx
function f1() {
  const x: any = expressionReturningFoo();  // 이거보다
  processBar(x);
}

function f2() {
  const x = expressionReturningFoo();
  processBar(x as any);  // 이게 낫다
}
```

여기서 두 번째 방법이 권장되는데, 이유는 `any` 타입이 `processBar` 함수의 매개변수에서만 사용되는 표현식이므로 ***다른 코드에는 영향을 주지 않기 때문이다.*** 

<br/>

위 경우,

`f1`은 함수가 종료될 때까지 x의 타입이 `any` 로 유지되지만,

`f2`에서는 `processBar` 호출 이후 x가 그대로 `foo` 타입이 된다. 

만약 `f1`함수가 `x`를 반환할 경우 문제가 더욱 커진다.

```tsx
function f1() {
  const x: any = expressionReturningFoo();
  processBar(x);
  return x;
}

function g() {
  const foo = f1();  // 타입이 any
  foo.fooMethod();  // 메서드가 체크되지 않는다
}
```

`g`함수 내에서 `f1`이 사용되므로, `f1`의 반환 타입이 `foo`의 타입에 영향을 미친다.

이처럼 함수에서 `any` 를 반환할 경우 프로젝트 전반에 걸쳐서 영향을 미칠 수 있어 주의해야 한다.

<br/>

반면 `any` 의 사용 범위를 좁게 제한하는 `f2`함수의 경우 `any` 타입이 함수 바깥으로 영향을 미치지 않는다.

<br/>

추가로 타입스크립트가 함수의 반환 타입을 추론할 수 있는 경우에도 함수의 반환 타입을 명시하는 것이 좋다.

함수의 반환 타입을 명시하면 `any` 타입이 함수 바깥으로 영향을 미치는 것을 방지할 수 있기 때문이다.

<br/>

`any`를 사용하지 않고 타입 오류를 제거하는 방법도 존재한다.

`@ts-ignore` 를 사용하면 `any` 를 사용하지 않고 오류를 제거할 수 있다.

하지만 근본적인 오류를 해결한 것이 아니기 때문에 다른 곳에서 문제가 발생할 수 있다.

```tsx
function f1() {
  const x = expressionReturningFoo();
  // @ts-ignore
  processBar(x);
  return x;
}
```

<br/>

객체와 관련한 `any` 의 사용법

```tsx
const config: Config = {
  a: 1,
  b: 2,
  c: {
    key: value
		// 해당 속성이 타입 오류를 가지는 상황이라 가정
  }
};
```

단순히 config 객체 전체를 `as any` 로 선언해서 오류를 제거할 수 있지만, 이는 좋지 않은 방법이다.

객체 전체를 `any` 로 단언하면, 다른 속성들(a, b)까지 타입 체크가 되지 않는 부작용이 발생한다.

<br/>

그러므로 아래처럼 최소한의 범위에만 `any` 를 사용하는 것이 좋다.

```tsx
// X
const config: Config = {
  a: 1,
  b: 2,
  c: {
    key: value
  }
} as any;  // 이렇게 하면 a,b의 체크를 놓치게 됨

// O
const config: Config = {
  a: 1,
  b: 2,
  c: {
    key: value as any  // 이렇게 하면 a,b는 여전히 체크된다
  }
};
```

### 요약

- 의도치 않은 타입 안전성의 손실을 피하기 위해 `any` 의 사용 범위를 최소한으로 좁혀야 한다.
- 함수의 반환 타입이 `any` 인 경우 타입 안정성이 나빠진다.
- 강제로 타입 오류를 제거하려면, `any` 대신 `@ts-ignore` 를 사용하는 것이 좋다.