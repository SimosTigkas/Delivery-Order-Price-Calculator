function Spinner() {
  return (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: 11,
        height: 11,
        border: "2px solid white",
        borderRightColor: "transparent",
        borderRadius: "50%",
        marginRight: 8,
        animation: "spin 0.8s linear infinite"
      }}
    />
  );
}

export default Spinner;
