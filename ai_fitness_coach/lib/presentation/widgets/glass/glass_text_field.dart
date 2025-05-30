import 'package:flutter/material.dart';
import 'dart:ui';

class GlassMorphicTextField extends StatefulWidget {
  final String label;
  final TextEditingController? controller;
  final bool obscureText;
  final IconData? prefixIcon;
  final TextInputType? keyboardType;
  final ValueChanged<String>? onChanged;
  final String? errorText;
  
  const GlassMorphicTextField({
    Key? key,
    required this.label,
    this.controller,
    this.obscureText = false,
    this.prefixIcon,
    this.keyboardType,
    this.onChanged,
    this.errorText,
  }) : super(key: key);

  @override
  State<GlassMorphicTextField> createState() => _GlassMorphicTextFieldState();
}

class _GlassMorphicTextFieldState extends State<GlassMorphicTextField> with TickerProviderStateMixin {
  late AnimationController _focusController;
  late Animation<double> _focusAnimation;
  late AnimationController _errorController;
  late Animation<double> _errorAnimation;
  final FocusNode _focusNode = FocusNode();
  bool _isFocused = false;
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _focusController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _errorController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    
    _focusAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _focusController,
      curve: Curves.easeInOut,
    ));
    
    _errorAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _errorController,
      curve: Curves.easeInOut,
    ));
    
    _focusNode.addListener(() {
      setState(() => _isFocused = _focusNode.hasFocus);
      if (_focusNode.hasFocus) {
        _focusController.forward();
      } else {
        _focusController.reverse();
      }
    });
    
    widget.controller?.addListener(() {
      final hasText = widget.controller!.text.isNotEmpty;
      if (hasText != _hasText) {
        setState(() => _hasText = hasText);
      }
    });
    
    if (widget.errorText != null) {
      _errorController.forward();
    }
  }

  @override
  void didUpdateWidget(covariant GlassMorphicTextField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.errorText != null && oldWidget.errorText == null) {
      _errorController.forward();
    } else if (widget.errorText == null && oldWidget.errorText != null) {
      _errorController.reverse();
    }
  }

  @override
  void dispose() {
    _focusController.dispose();
    _errorController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_focusController, _errorController]),
      builder: (context, child) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                if (_isFocused)
                  BoxShadow(
                    color: widget.errorText != null 
                        ? Colors.red.withOpacity(0.2)
                        : const Color(0xFF007AFF).withOpacity(0.2),
                    blurRadius: 20,
                    offset: const Offset(0, 10),
                  ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(20),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
                child: Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    gradient: LinearGradient(
                      colors: [
                        Colors.white.withOpacity(0.85 + (0.1 * _focusAnimation.value)),
                        Colors.white.withOpacity(0.8 + (0.1 * _focusAnimation.value)),
                      ],
                    ),
                    border: Border.all(
                      color: widget.errorText != null
                          ? Colors.red.withOpacity(0.5)
                          : _isFocused 
                              ? const Color(0xFF007AFF).withOpacity(0.5)
                              : Colors.white.withOpacity(0.2),
                      width: 1.5,
                    ),
                  ),
                  child: Stack(
                    children: [
                      Padding(
                        padding: EdgeInsets.only(
                          left: widget.prefixIcon != null ? 50 : 20,
                          right: 20,
                          top: 20,
                          bottom: 8,
                        ),
                        child: TextField(
                          controller: widget.controller,
                          obscureText: widget.obscureText,
                          keyboardType: widget.keyboardType,
                          focusNode: _focusNode,
                          onChanged: widget.onChanged,
                          style: const TextStyle(
                            color: Colors.black87,
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                          decoration: const InputDecoration(
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                      ),
                      // Floating label
                      AnimatedPositioned(
                        duration: const Duration(milliseconds: 200),
                        curve: Curves.easeOut,
                        left: widget.prefixIcon != null ? 50 : 20,
                        top: _isFocused || _hasText ? 8 : 20,
                        child: AnimatedDefaultTextStyle(
                          duration: const Duration(milliseconds: 200),
                          style: TextStyle(
                            color: widget.errorText != null
                                ? Colors.red.withOpacity(0.7)
                                : _isFocused 
                                    ? const Color(0xFF007AFF)
                                    : Colors.black54,
                            fontSize: _isFocused || _hasText ? 12 : 16,
                            fontWeight: _isFocused || _hasText ? FontWeight.w600 : FontWeight.w500,
                          ),
                          child: Text(widget.label),
                        ),
                      ),
                      // Prefix icon
                      if (widget.prefixIcon != null)
                        Positioned(
                          left: 16,
                          top: 16,
                          child: Icon(
                            widget.prefixIcon,
                            color: widget.errorText != null
                                ? Colors.red.withOpacity(0.7)
                                : _isFocused
                                    ? const Color(0xFF007AFF)
                                    : Colors.black54,
                            size: 24,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          if (widget.errorText != null)
            Padding(
              padding: const EdgeInsets.only(left: 20, top: 8),
              child: Text(
                widget.errorText!,
                style: TextStyle(
                  color: Colors.red.withOpacity(0.8),
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
        ],
      ),
    );
  }
}