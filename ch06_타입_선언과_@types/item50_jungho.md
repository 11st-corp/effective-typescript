# 아이템50 오버로딩 타입보다는 조건부 타입을 사용하기

```tsx
function double(x) {
	return x + x;
}
```

위의 double 함수에는 number 또는 string이 올 수 있으며 함수 return 값도 number 나 string을 기대할 수 있다.

이 double 함수에 타입 정보를 추가하고자 한다면, 아래와 같은 방법들을 떠올릴 수 있다.

```tsx
/** 
 * 유니온 타입 
 */ 
function double(x: number|string): number|string
// param: number => return: string이 되는 경우도 포함되어 버림

/** 
 * 제네릭 
 */ 
function double<T extends number|string>(x: T): T;
// 리터럴 문자열 'x'가 param으로 들어오면, return타입이 'x'가 되어 버림

/** 
 * 오버로딩 
 */
function double(x: number): number
function double(x: string): string;
// param으로 유니온 타입이 오는 경우 타입 오류가 발생
// string|number 타입을 추가로 오버로딩하면 되지만, 좋지 않은 방법
```

그렇다면 가장 좋은 해결 방법은 무엇일까?

조건부 타입(conditional type)을 사용하는 것이다.

```tsx
function double<T extends number | string>( 
	x: T
): T extends string ? string : number;

function double(x: any) { return x + x; }
```

조건부 타입은 자바스크립트의 삼항 연산자(`? :`) 문법과 같이 사용하면 되므로 받아들이기 쉽다.

이렇게 타입을 작성하게 되면 앞선 모든 예제의 문제점을 보완할 수 있다.

오버로딩 타입이 작성하기는 쉽지만, 조건부 타입이 타입을 더 정확히 하는데 도움을 줄 수 있다.

오버로딩 타입을 작성하는 상황에서 조건부 타입이 필요한 상황이 주로 발생하므로, 오버로딩 타입을 작성 중이라면 조건부 타입 사용을 검토해 보는 것이 좋다.