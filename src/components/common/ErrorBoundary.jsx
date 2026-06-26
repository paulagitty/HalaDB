import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-lg font-bold text-red-700 mb-2">App crashed</h2>
          <p className="text-sm text-red-600 mb-4 max-w-md">{this.state.error.message}</p>
          <button type="button" onClick={() => window.location.reload()} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold">
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
