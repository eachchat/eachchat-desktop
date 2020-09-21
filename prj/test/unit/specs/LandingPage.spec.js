import Vue from 'vue'

function sum(number){
      return number + 1;
  }
  
  describe("测试函数",function(){
  
      it("需要测试的函数1",function(){
           expect(sum(1)).to.equal(2);    //sum(1)是index.js中的方法，toBe(2)是期望的结果。
      });
      it("需要测试的函数2",function(){
           expect(sum(1)).to.equal(1);    //sum(1)是index.js中的方法，toBe(2)是期望的结果。
      });
  });
