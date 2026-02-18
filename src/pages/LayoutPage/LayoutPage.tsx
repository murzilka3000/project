import { Outlet } from "react-router-dom"
import styles from "@/styles/Layout.module.scss"

function LayoutPage() {
  return (
    <>
      <div className={styles.application}>
        <main>
          <Outlet />
          {/* <NotificationContainer />
          {modalInfo.isShow && <ModalInformation close={closeModal} />}
          {modalConfirm.isShow && <ModalConfirmation close={closeModal} />}
          {modalAuth.isShow && <ModalAuth />} */}
        </main>
      </div>
    </>
  )
}

export default LayoutPage
