import { UpcProduct } from "@/types/UpcResponse";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { UpcDetailsForm } from "./UpcDetailsForm";

type UpcDetailsProps = {
  upcProduct?: UpcProduct;
};

export function UpcDetails(props: UpcDetailsProps) {
  const { upcProduct } = props;

  if (!upcProduct) return null;
  return <UpcDetailsForm upcProduct={upcProduct}/>
}
