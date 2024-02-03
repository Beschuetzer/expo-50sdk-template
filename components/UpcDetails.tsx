import { UpcProduct } from "@/types/UpcResponse";
import ObjectRenderer from "./ObjectRenderer";
import { View } from "native-base";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";

type UpcDetailsProps = {
  upcProduct?: UpcProduct;
};

export function UpcDetails(props: UpcDetailsProps) {
  const { upcProduct } = props;

  console.log({
    objToRender: { name: upcProduct?.product_name, code: upcProduct?.id },
  });

  if (!upcProduct) return null;
  return (
    <BottomSheetScrollView>
      <ObjectRenderer
        object={{ name: upcProduct?.product_name, code: upcProduct?.id } || {}}
      />
    </BottomSheetScrollView>
  );
}
