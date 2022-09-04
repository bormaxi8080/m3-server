/**
 * Created by kirillvirich on 09.10.14.
 */
package org.plamee.model.vo {
import org.plamee.model.vo.*;

import mx.collections.ArrayCollection;

public class PieceSpecialCombinationVO extends PieceVO {

    private var mId: String;

    public function PieceSpecialCombinationVO(id: String) {
        mId = id;
    }

    override public function getName():String {
        switch (mId) {
            case "15_1_1":
                return "plate_plate";
            case "15_1_2":
                return "plate_rainbow";
            case "15_2_2":
                return "rainbow_rainbow";
            case "15_2_3":
                return "rainbow_striped";
            case "15_3_3":
                return "striped_striped";
            case "15_3_1":
                return "striped_plate";
        }
        return "";
    }

    public static function getAllSource():ArrayCollection
    {
        return new ArrayCollection(
            [
                {id:"15_1_1", source:"../assets/plate_plus_plate.png"},
                {id:"15_1_2", source:"../assets/plate_plus_rainbow.png"},
                {id:"15_2_2", source:"../assets/rainbow_plus_rainbow.png"},
                {id:"15_2_3", source:"../assets/striped_plus_rainbow.png"},
                {id:"15_3_3", source:"../assets/striped_plus_striped.png"},
                {id:"15_3_1", source:"../assets/striped_plus_plate.png"}
            ]
        );
    }
}
}
