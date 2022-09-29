# 아이템 10. 객체 래퍼 타입 피하기 

자바스크립트 기본형들은 불변이며 메서드를 가지지 않는다는 점에서 객체와 구분됩니다. 

```js
'primitive'.charAt(3) //"m"
```

위 예제에서 사실 charAt은 string의 메서드가 아닙니다. 기본형 string에는 메서드가 없지만 자바스크립트에는 메서드를 가지는 String '객체' 타입을 자유롭게 반환합니다. string 기본형에 charAt 같은 메서드를 사용할 때, 자바스크립트는 기본형을 String 객체로 래핑 (Wrap)하고, 메서드를 호출하고 마지막에 래핑한 객체를 버립니다. 

> #### 래퍼 객체(wrapper object)
>
> [참고 링크](http://www.tcpschool.com/javascript/js_standard_object)
>
> ```js
> const str = "문자열";  // 문자열 생성
> 
> const len = str.length; // 문자열 프로퍼티인 length 사용
> ```
>
> 위의 예제에서 생성한 문자열 리터럴 str은 객체가 아닌데도 length 프로퍼티를 사용할 수 있습니다. 프로그램이 문자열 리터럴 str의 프로퍼티를 참조하려고 하면, 자바스크립트는 new String(str)을 호출한 것처럼 문자열 리터럴을 객체로 자동 변환해주기 때문입니다.
>
> 이렇게 생성된 임시 객체는 String 객체의 메소드를 상속받아 프로퍼티를 참조하는 데 사용됩니다.
>
> 이후 프로퍼티의 참조가 끝나면 사용된 임시 객체는 자동으로 삭제됩니다.
>
> 이렇게 숫자, 문자열, 불리언 등 원시 타입의 프로퍼티에 접근하려고 할 때 생성되는 임시 객체를 래퍼 객체(wrapper object)라고 합니다.
>
>  
>
> ##### 예제
>
> ```js
> const str = "문자열";      // 문자열 리터럴 생성
> 
> const  strObj = new String(str); // 문자열 객체 생성
> 
> str.length;          // 리터럴 값은 내부적으로* 래퍼 *객체를 생성한 후에 length 프로퍼티를 참조함.
> 
> str == strObj;       // 동등 연산자는 리터럴 값과 해당* 래퍼 *객체를 동일하게 봄.
> 
> str === strObj;      // 일치 연산자는 리터럴 값과 해당* 래퍼 *객체를 구별함.
> 
> typeof str;          // string 타입
> 
> typeof strObj;       // object 타입
> ```

```js
//실제로는 이렇게 하지 마세요!
const originalCharAt = String.prototype.charAt;
String.prototype.charAt = function(pos) {
  console.log(this, typeof this, pos);
  return originalCharAt.call(this, pos);
}
console.log("primitive".charAt(3));
```

 이 코드는 다음을 출력합니다 

```js
[String: "primitive"] "object" 3
```



메서드 내의 `this`는 `string 기본형`이 아닌 `String 객체 래퍼`입니다. `String 객체 래퍼`는 `String 객체`를 직접 생성할 수도 있으며, string 기본형처럼 동작합니다. 

 `string(기본형)`과 `String(객체 래퍼)`은 항상 동일하게 동작하지 않습니다. 예를 들어, `String 객체`는 오직 자기 자신하고만 동일합니다. 

```js
"hello" === new String("hello") //false
new String("hello") === new String("hello") //false
String === String //true
```



객체 래퍼 타입의 자동 변환은 당황스러운 동작을 보일 때가 있습니다. 예를 들어 어떤 속성을 기본형에 할당했을 때 그 속성이 사라집니다.

```js
x = "hello";
x.language = "English"
x.language //undefined

```

- 실제로는 `x`가 `String` 객체로 변환된 후 language 속성이 추가되었고, language 속성이 추가된 객체는 버려진 것입니다.



다른 기본형에도 동일하게 객체 래퍼 타입이 존재합니다.

- number - Number
- Boolean - Boolean
- symbol - Symbol
- Bigint - BigInt

`null`과 `undefined`에는 객체 래퍼가 없습니다.

이 래퍼 타입들 덕분에 기본형 값에 메서드를 사용할 수 있고, 정적 메서드 (``String.fromCharCode` 등)도 사용할 수 있습니다. 그러나 보통은 래퍼 객체를 직접 생성할 필요가 없습니다. 타입스크립트는 기본형과 객체 래퍼 타입을 별도로 모델링합니다.

- string과 String
- number와 Number
- boolean과 Boolean
- symbol과 Symbol
- bigint와 BigInt

`string`을 사용할 때는 특히 유의해야 하는데, `string`을 `String`이라고 잘못 타이핑하더라도 처음에는 잘 동작하는 것처럼 보이기 때문입니다.

```js
function getStringLen(foo: String) {
  return foo.length;
}

getStringLen("hello");             //정상
getStringLen(new String("hello")); //정상
```

그러나 `string`을 매개변수로 받는 메서드에 `String 객체`를 전달하는 순간 문제가 발생합니다.

```js
function isGreeting(phrase: String) {
  return [
    'hello',
    'good day'
  ].includes(phrase);
}
```

- `phrase`에서 에러 발생 : ``'String'`` 형식의 인수는 ``'string'`` 형식의 매개변수에 할당될 수 없습니다. ``'string'``은(는) 기본 개체이지만 ``'String'``은(는) 래퍼 개체입니다. 가능한 경우 ``'string'``을(를) 사용하세요.

`string`은 `String`에 할당할 수 있지만 `String`은 `string`에 할당할 수 없습니다. 오류 메세지대로 `string` 타입을 사용해야 합니다. 



```js
const s: String = "primitive";
const n: Number = 12;
const b: Boolean = true;
```

위 예제에서 런타임의 값은 기본형입니다. 그러나 **기본형 타입은 객체 래퍼에 할당할 수 있기 때문**에 타입스크립트는 기본형 타입을 객체 래퍼에 할당하는 선언을 허용합니다. 그러나 기본형 타입을 객체 래퍼에 할당하는 구문은 오해하기 쉽고, 그렇게 할 필요도 없기 때문에 그냥 기본형 타입을 사용하는 것이 낫습니다. (아이템 19에서 계속) 

### BigInt, Symbol

```js
typeof BigInt(1234) // "bigint"
typeof Symbol('sym') // "symbol"
```

그런데 `new` 없이 `BigInt`와 `Symbol`을 호출하는 경우는 **기본형을 생성**하기 때문에 사용해도 좋습니다. 위 예제는 `bigint`와 `symbol`타입의 값이 됩니다.



## 결론

- String 대신 string
- Number 대신 number
- Boolean 대신 boolean
- Symbol 대신 symbol
- BigInt 대신 bigint

를 사용하자.

