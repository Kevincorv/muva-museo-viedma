import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  onError: () => void;
}

interface State {
  hasError: boolean;
}

/**
 * Delimitador de errores para el canvas 3D.
 *
 * Se usa en dos niveles: envolviendo el `<Canvas>` (errores de montaje del DOM)
 * y dentro del canvas (errores de la escena R3F, que corre en otra raíz de
 * React y no burbujea hacia el árbol principal).
 */
export default class MuseumErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
