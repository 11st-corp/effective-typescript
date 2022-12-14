# 정보를 감추는 목적으로 `private`를 사용하지 않기

> JS 내에서는 클래스에 비공개 속성을 만들 수 없습니다. 그 대신, `_`를 속성명의 접두사로 사용하는 것이 관례입니다.


```typescript
class Human {
 _name = 'chanwoo';   
}

const chanwoo = new Human();
chanwoo._name;
```

- 관례는 관례일뿐, 정보의 은닉화가 제대로 이루어지지 않는다.

<br/>

#### TS에서는 접근자를 사용하여 편집기에서 접근하지 못하도록 에러를 명시할 수 있다.
```typescript
class Human {
 private name = 'chanwoo';   
}

const chanwoo = new Human();
chanwoo._name; 
```
- `TS2339: Property '_name' does not exist on type 'Human'.`
- `private`를 사용하면 `_name`에 접근하지 못하도록 한다. 하지만 TS는 컴파일시에 사라지기 때문에 위의 코드와 동일하다.


```typescript
class Human {
 private name = 'chanwoo';   
}

const chanwoo = new Human();
(chanwoo as any)._name;
```
- 심지어 any 단언문을 사용하면 `private` 접근 제어자도 소용이 없다.

<br/>

### JS에서는 정보의 은닉화를 위해서 클로저(closure)를 사용한다.

> 클래스에서는 생성자에 클로저를 만들 수 있습니다.

```typescript
class PasswordChecker {
    checkPassword: (password: string) => boolean;
    constructor(passwordHash: number) {
        this.checkPassword = (password: string) => {
            return hash(password) === passwordHash;
        }
    }
}
```
- `passwordHash`는 생성자에서만 접근이 가능하다. 즉, 해당 변수는 감추어졌다.
- 하지만 해당 변수에 접근하기 위해서는 반드시 생성자 내에서 선언되어야하므로, 메서드 역시 내부에 정의되어야하고, 이렇게 되면 메서드의 복사본이 모든 인스턴스에 생성되기 때문에 메모리가 낭비된다. (클래스의 메서드의 경우, 모든 인스턴스가 공유할 수 있다.)

<br/>

### JS에서는 정보의 은닉화를 위해서 또 다른 방식은 비공개 필드 기능이 있다.
```typescript
class PasswordChecker {
    #passwordHash: number;
    
    constructor(passwordHash: number) {
        this.#passwordHash = passwordHash;
    }

    checkPassword(password: string){
        return hash(password) === passwordHash;
    };
}
```
- 클로저와 동일하게 `passwordHash`는 감추어졌다. 또한 클로저의 문제점이었던 생성자에서의 메서드 선언이 외부에서도 가능해졌다.
- 비공개 필드 기능을 지원하지 않는 경우, `weakMap`으로 구현되어 제공한다고 한다.


### 정리하자면,

#### 1. `_`, `private` 접근제어자의 경우, 단순히 표기상으로만 정보의 은닉이 이루어진다.  

#### 2. JS에서는 클로저나 비공개 필드 기능을 통해 정보의 은닉을 구현할 수 있다.