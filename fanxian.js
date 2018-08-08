'use strict'

const ADMIN_ADDRESS = "n1MsdXauB5jKKjMjeSXw3FcJbCR275LLaar";
const ADMIN_ADDRESS2 = "n1MsdXauB5jKKjMjeSXw3FcJbCR275LLaar";

//手续费
const TAX = new BigNumber(0.1);

var FanxianItem = function(text){
    if(text){
        var obj = JSON.parse(text);
        this.sellerId = obj.sellerId;
		this.tradeId = obj.tradeId;
        this.goodUrl = obj.goodUrl;
        this.buyerId = obj.buyerId;
		this.websiteType = obj.websiteType;
        this.sellerAddress = obj.sellerAddress;
    }
}

var FanxianContract = function () {
    //user's game data
	
	LocalContractStorage.defineMapProperty(this, "trade");
	
    LocalContractStorage.defineMapProperty(this, "buyer");

    LocalContractStorage.defineMapProperty(this, "seller");

    //total user count
    LocalContractStorage.defineProperty(this, "buyerCount");


    LocalContractStorage.defineProperty(this, "sellerCount");

	LocalContractStorage.defineProperty(this, "goodtimes");
	
	LocalContractStorage.defineMapProperty(this, "finishTrade");
}

FanxianContract.prototype = {
	
	init:function(){
		
		this.goodtimes = 0;
		this.buyerCount = 0;
		this.sellerCount = 0;
	},
	
	requestNas:function(tradeId, sellerId, goodUrl, buyerId, websiteType, sellerAddress){
		
	 	if(!sellerId || !goodUrl || !buyerId || !websiteType || !sellerAddress || !tradeId){
            throw new Error("empty information");
        }

        var fanxianitem = this.trade.get(tradeId);
        if(fanxianitem){
            throw new Error("trade has been occupied");
        }

        fanxianitem = new FanxianItem();
		fanxianitem.tradeId = tradeId;
        fanxianitem.sellerId = sellerId;
        fanxianitem.goodUrl = goodUrl;
		fanxianitem.buyerId = buyerId;
		fanxianitem.websiteType = websiteType;
		fanxianitem.sellerAddress = sellerAddress;				

        this.trade.put(tradeId, fanxianitem);		// 保存买家发送nas请求信息		
		this.goodtimes = this.goodtimes + 1;		// 好评商品数+1 
		
		var user = this.buyer.get(buyerId); 
		
		if (!user) {
			
			this.buyerCount = this.buyerCount +1;
				
			this.buyer.put(buyerId, 1);					// 记录用户
		}
		
				
		var seller = this.seller.get(sellerId);
		
		if (!seller) {
			
			this.sellerCount = this.sellerCount +1;
				
			this.seller.put(sellerId, 1);					// 记录用户
		}
		
		
		return "提交成功，请等待或通知商家登录支付";

	},
	
	checkNas:function(tradeId, sellerId, nas, buyerWallet) {
		
		    var fromUser = Blockchain.transaction.from,
            ts = Blockchain.transaction.timestamp,
            txhash = Blockchain.transaction.hash,
            value = Blockchain.transaction.value;
		
		//收取手续费
        Blockchain.transfer(ADMIN_ADDRESS, value.times(TAX).div(2));
		
//var naspay = nas*1000000000000000000;
		var nas1 = new BigNumber(parseInt((nas*1000000000000000000)-(value.times(TAX).div(2))));
       // Blockchain.transfer(address, nas1);
		//var nas1 = new BigNumber(naspay);
        Blockchain.transfer(buyerWallet, nas1);
		
		this.finishTrade.put(tradeId, 1);
		
		return "支付NAS成功";
		
	},
	get:function(tradeId) {
		
		if(!tradeId){
            throw new Error("empty trade");
        }
		
		var finish = this.finishTrade.get(tradeId);
		
		if(finish) {
			
			throw new Error("finish");
			
			return "该交易已关闭";
			
		}
		
        return this.trade.get(tradeId);
		
	},  
 	getuser:function(buyerId) {
		
		if(!buyerId){
            throw new Error("empty buyer");
        }
        return this.buyer.get(buyerId);
		
	},
	getseller:function(sellerId) {
		
		if(!sellerId){
            throw new Error("empty buyer");
        }
        return this.seller.get(sellerId);
		
	},
	getdatas: function(){
		
		return [this.buyerCount,this.sellerCount,this.goodtimes];
	}
	//getTotalSellers: function(){
		//return this.sellerCount;
	//},
	//getTotalTrades: function(){
		
		//return this.goodtimes;
	//} 
	
}


module.exports = FanxianContract;