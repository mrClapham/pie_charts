/**
 * Created with JetBrains WebStorm.
 * User: grahamclapham
 * Date: 29/05/2013
 * Time: 09:32
 * To change this template use File | Settings | File Templates.
 */

function PieData2Layer(){
    var scope = {
        model:{
            pieData:[],

            maxSegmentMajor:6,
            minSegmentMajor:2,
            maxSegmentsMinor:6,
            minSegmentsMinor:2,
            segmentsMajor:4,
            segmentsMinor:4
        },
        controller:{
            generateRandom:function(min, max){
                return Math.ceil( Math.random() * (max - min) + min );
            },
            run:function(){
                scope.model.pieData = []

                for(var i =0; i<scope.model.segmentsMajor; i++){
                    var seg = []
                    for(var n=0; n<scope.model.segmentsMinor; n++){
                        seg.push( {"label": "Item : "+String(n), "value": scope.controller.generateRandom(1, 4)} )
                    }
                    scope.model.pieData.push({label:'Major segment :'+i, data:seg})

                }
                return scope.model.pieData
            }
        },
        generateDummyPieData:function(num){
        var _pieData=[];
            for(var i= 0; i<num; i++){
                _pieData.push( {"label": "Iten num: "+String(i)+':'+String(n), "value": scope.controller.generateRandom(80, 900)} )
            }
            return _pieData
        }
    }

  scope.getRandom = function(){
      scope.model.segmentsMajor = scope.controller.generateRandom(scope.model.minSegmentMajor, scope.model.maxSegmentMajor);
      scope.model.segmentsMinor = scope.controller.generateRandom(scope.model.minSegmentsMinor, scope.model.maxSegmentsMinor);

      return scope.controller.run()
  }

  scope.getRandom1Layer = function(value){
      return scope.controller.generateDummyPieData(value)
  }

  return scope

}
