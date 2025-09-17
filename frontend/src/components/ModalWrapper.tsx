import { type ReactNode } from "react";
import { Dialog } from "primereact/dialog";

type ModalProps = {
  header: string;
  visible: boolean;
  onHide: () => void;
  width?: string;
  children: ReactNode;
};

export default function ModalWrapper({ header, visible, onHide, width = "50vw", children }: ModalProps) {
  return (
    <Dialog header={header} visible={visible} style={{ width }} modal onHide={onHide}>
      {children}
    </Dialog>
  );
}

