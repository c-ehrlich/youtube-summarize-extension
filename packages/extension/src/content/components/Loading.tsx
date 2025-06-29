/** @jsxImportSource solid-js */
import { LoadingSpinner } from "../../ui-solid/loading-spinner";
import styles from "./Loading.module.css";

export const Loading = (props: { text: string }) => {
  return (
    <div class={styles.container}>
      <LoadingSpinner size={32} />
      <div class={styles.spacer} />
      <p>{props.text}</p>
    </div>
  );
};
